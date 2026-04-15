/* eslint-env node */
import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
// const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const normalizeDate = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

async function fetchWorkspaceState(activeIndex = 0) {
  const [boardRows] = await pool.query(
    "SELECT id, title, background_color FROM boards ORDER BY id ASC"
  );
  const [listRows] = await pool.query(
    "SELECT id, board_id, title, position FROM lists ORDER BY board_id, position, id"
  );
  const [cardRows] = await pool.query(
    "SELECT id, list_id, title, description, due_date, position FROM cards WHERE archived = FALSE ORDER BY list_id, position, id"
  );
  const [labelRows] = await pool.query(
    `SELECT cl.card_id, l.title
     FROM card_labels cl
     JOIN labels l ON l.id = cl.label_id`
  );
  const [memberRows] = await pool.query(
    "SELECT id, full_name, avatar_color FROM members ORDER BY id ASC"
  );
  const [cardMemberRows] = await pool.query(
    "SELECT card_id, member_id FROM card_members"
  );
  const [checklistRows] = await pool.query(
    "SELECT id, card_id FROM checklists ORDER BY id ASC"
  );
  const [checklistItemRows] = await pool.query(
    "SELECT checklist_id, id, content, is_completed FROM checklist_items ORDER BY position, id"
  );

  const labelsByCard = new Map();
  for (const row of labelRows) {
    const labels = labelsByCard.get(row.card_id) || [];
    labels.push(row.title);
    labelsByCard.set(row.card_id, labels);
  }

  const membersByCard = new Map();
  for (const row of cardMemberRows) {
    const members = membersByCard.get(row.card_id) || [];
    members.push(row.member_id);
    membersByCard.set(row.card_id, members);
  }

  const checklistByCard = new Map();
  for (const checklist of checklistRows) {
    checklistByCard.set(checklist.card_id, checklist.id);
  }

  const checklistItemsByChecklist = new Map();
  for (const item of checklistItemRows) {
    const items = checklistItemsByChecklist.get(item.checklist_id) || [];
    items.push({
      id: item.id,
      text: item.content,
      completed: Boolean(item.is_completed)
    });
    checklistItemsByChecklist.set(item.checklist_id, items);
  }

  const cardsByList = new Map();
  for (const card of cardRows) {
    const cards = cardsByList.get(card.list_id) || [];
    const checklistId = checklistByCard.get(card.id);
    cards.push({
      id: card.id,
      title: card.title,
      description: card.description || "",
      labels: labelsByCard.get(card.id) || [],
      dueDate: normalizeDate(card.due_date),
      checklist: checklistId ? checklistItemsByChecklist.get(checklistId) || [] : [],
      members: membersByCard.get(card.id) || []
    });
    cardsByList.set(card.list_id, cards);
  }

  const listsByBoard = new Map();
  for (const list of listRows) {
    const lists = listsByBoard.get(list.board_id) || [];
    lists.push({
      id: list.id,
      title: list.title,
      cards: cardsByList.get(list.id) || []
    });
    listsByBoard.set(list.board_id, lists);
  }

  const boards = boardRows.map((board) => ({
    id: board.id,
    name: board.title,
    bgcolor: board.background_color,
    lists: listsByBoard.get(board.id) || []
  }));

  return {
    active: boards.length ? Math.max(0, Math.min(activeIndex, boards.length - 1)) : 0,
    members: memberRows.map((member) => ({
      id: member.id,
      name: member.full_name,
      avatar: member.full_name.charAt(0).toUpperCase(),
      color: member.avatar_color
    })),
    boards
  };
}

async function ensureMembers(connection, members = []) {
  const memberIdMap = new Map();
  for (const member of members) {
    if (!member?.name) continue;
    const [existing] = await connection.query(
      "SELECT id FROM members WHERE full_name = ? LIMIT 1",
      [member.name]
    );
    let dbId;
    if (existing.length > 0) {
      dbId = existing[0].id;
    } else {
      const [inserted] = await connection.query(
        "INSERT INTO members (full_name, avatar_color) VALUES (?, ?)",
        [member.name, member.color || "#1f6feb"]
      );
      dbId = inserted.insertId;
    }
    memberIdMap.set(member.id, dbId);
    memberIdMap.set(String(dbId), dbId);
    memberIdMap.set(dbId, dbId);
  }
  return memberIdMap;
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/api/board", async (_, res) => {
  try {
    const state = await fetchWorkspaceState();
    return res.json(state);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch board", details: error.message });
  }
});

app.post("/api/boards", async (req, res) => {
  const { title, backgroundColor } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO boards (title, background_color) VALUES (?, ?)",
      [title, backgroundColor || "#026aa7"]
    );
    return res.status(201).json({ id: result.insertId, title, backgroundColor: backgroundColor || "#026aa7" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create board", details: error.message });
  }
});

app.post("/api/lists", async (req, res) => {
  const { boardId, title, position } = req.body;
  if (!boardId || !title) {
    return res.status(400).json({ error: "boardId and title are required" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO lists (board_id, title, position) VALUES (?, ?, ?)",
      [boardId, title, position ?? 0]
    );
    return res.status(201).json({ id: result.insertId, boardId, title, position: position ?? 0 });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create list", details: error.message });
  }
});

app.put("/api/lists/:id", async (req, res) => {
  const listId = Number(req.params.id);
  const { title, position } = req.body;
  try {
    await pool.query("UPDATE lists SET title = COALESCE(?, title), position = COALESCE(?, position) WHERE id = ?", [
      title ?? null,
      Number.isInteger(position) ? position : null,
      listId
    ]);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update list", details: error.message });
  }
});

app.delete("/api/lists/:id", async (req, res) => {
  const listId = Number(req.params.id);
  try {
    await pool.query("DELETE FROM lists WHERE id = ?", [listId]);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete list", details: error.message });
  }
});

app.post("/api/cards", async (req, res) => {
  const { listId, title, description, dueDate, position } = req.body;
  if (!listId || !title) {
    return res.status(400).json({ error: "listId and title are required" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO cards (list_id, title, description, due_date, position) VALUES (?, ?, ?, ?, ?)",
      [listId, title, description || "", dueDate || null, position ?? 0]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create card", details: error.message });
  }
});

app.put("/api/cards/:id", async (req, res) => {
  const cardId = Number(req.params.id);
  const { title, description, dueDate, listId, position, archived } = req.body;
  try {
    await pool.query(
      `UPDATE cards
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           due_date = ?,
           list_id = COALESCE(?, list_id),
           position = COALESCE(?, position),
           archived = COALESCE(?, archived)
       WHERE id = ?`,
      [
        title ?? null,
        description ?? null,
        dueDate === undefined ? null : dueDate,
        listId ?? null,
        Number.isInteger(position) ? position : null,
        archived ?? null,
        cardId
      ]
    );
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update card", details: error.message });
  }
});

app.delete("/api/cards/:id", async (req, res) => {
  const cardId = Number(req.params.id);
  try {
    await pool.query("DELETE FROM cards WHERE id = ?", [cardId]);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete card", details: error.message });
  }
});

app.put("/api/board", async (req, res) => {
  const { board } = req.body;
  if (!board || !Array.isArray(board.boards) || board.boards.length === 0) {
    return res.status(400).json({ error: "Invalid board payload" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const memberIdMap = await ensureMembers(connection, board.members || []);


    await connection.query("DELETE FROM boards");

    for (const incomingBoard of board.boards) {
      const [insertedBoard] = await connection.query(
        "INSERT INTO boards (title, background_color) VALUES (?, ?)",
        [incomingBoard.name, incomingBoard.bgcolor || "#026aa7"]
      );
      const boardId = insertedBoard.insertId;

      const allLabels = new Set();
      for (const list of incomingBoard.lists || []) {
        for (const card of list.cards || []) {
          for (const label of card.labels || []) {
            if (label) allLabels.add(label);
          }
        }
      }

      const labelIdMap = new Map();
      for (const label of allLabels) {
        const [insertedLabel] = await connection.query(
          "INSERT INTO labels (board_id, title, color) VALUES (?, ?, ?)",
          [boardId, label, "#2563eb"]
        );
        labelIdMap.set(label, insertedLabel.insertId);
      }

      let listPosition = 1;
      for (const list of incomingBoard.lists || []) {
        const [insertedList] = await connection.query(
          "INSERT INTO lists (board_id, title, position) VALUES (?, ?, ?)",
          [boardId, list.title, listPosition]
        );
        const dbListId = insertedList.insertId;
        listPosition += 1;

        let cardPosition = 1;
        for (const card of list.cards || []) {
          const [insertedCard] = await connection.query(
            "INSERT INTO cards (list_id, title, description, due_date, position) VALUES (?, ?, ?, ?, ?)",
            [dbListId, card.title, card.description || "", card.dueDate || null, cardPosition]
          );
          const dbCardId = insertedCard.insertId;
          cardPosition += 1;

          for (const label of card.labels || []) {
            const labelId = labelIdMap.get(label);
            if (labelId) {
              await connection.query(
                "INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)",
                [dbCardId, labelId]
              );
            }
          }

          for (const memberId of card.members || []) {
            const resolvedMemberId = memberIdMap.get(memberId) || memberIdMap.get(String(memberId));
            if (resolvedMemberId) {
              await connection.query(
                "INSERT INTO card_members (card_id, member_id) VALUES (?, ?)",
                [dbCardId, resolvedMemberId]
              );
            }
          }

          if (card.checklist?.length) {
            const [insertedChecklist] = await connection.query(
              "INSERT INTO checklists (card_id, title, position) VALUES (?, ?, 1)",
              [dbCardId, "Checklist"]
            );
            let checklistPosition = 1;
            for (const item of card.checklist) {
              await connection.query(
                "INSERT INTO checklist_items (checklist_id, content, is_completed, position) VALUES (?, ?, ?, ?)",
                [insertedChecklist.insertId, item.text || "", Boolean(item.completed), checklistPosition]
              );
              checklistPosition += 1;
            }
          }
        }
      }
    }

    await connection.commit();
    const state = await fetchWorkspaceState(board.active ?? 0);
    return res.json(state);
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ error: "Failed to save board", details: error.message });
  } finally {
    connection.release();
  }
});

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);

// });
export default app;

