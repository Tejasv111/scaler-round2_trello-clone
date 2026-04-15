const API_BASE = "/api";

export async function fetchBoard() {
  const res = await fetch(`${API_BASE}/board`);
  if (!res.ok) {
    throw new Error("Failed to fetch board");
  }
  return res.json();
}

export async function saveBoard(board) {
  const res = await fetch(`${API_BASE}/board`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board })
  });
  if (!res.ok) {
    throw new Error("Failed to save board");
  }
  return res.json();
}

