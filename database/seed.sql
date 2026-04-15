USE trello_clone;

INSERT INTO members (full_name, email, avatar_color) VALUES
('Tejasv Mahant', 'tejasv@example.com', '#1d4ed8'),
('Alex Wong', 'alex@example.com', '#16a34a'),
('Sara Patel', 'sara@example.com', '#9333ea');

INSERT INTO boards (title, background_color) VALUES
('My Trello Board', '#026aa7');

INSERT INTO lists (board_id, title, position) VALUES
(1, 'To Do', 1),
(1, 'In Progress', 2),
(1, 'Done', 3);

INSERT INTO cards (list_id, title, description, position) VALUES
(1, 'Define MVP scope', 'Finalize assignment checklist.', 1),
(2, 'Implement card details modal', 'Add labels, due date, checklist, members.', 1);

INSERT INTO labels (board_id, title, color) VALUES
(1, 'frontend', '#2563eb'),
(1, 'backend', '#059669'),
(1, 'urgent', '#dc2626');

INSERT INTO card_labels (card_id, label_id) VALUES
(1, 1),
(2, 2);

INSERT INTO card_members (card_id, member_id) VALUES
(1, 1),
(2, 2);

INSERT INTO checklists (card_id, title, position) VALUES
(1, 'Development', 1);

INSERT INTO checklist_items (checklist_id, content, is_completed, position) VALUES
(1, 'Board management', TRUE, 1),
(1, 'DnD cards and lists', FALSE, 2);

