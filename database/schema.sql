CREATE DATABASE IF NOT EXISTS trello_clone;
USE trello_clone;

CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE,
  avatar_color VARCHAR(20) DEFAULT '#1f6feb',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS boards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(140) NOT NULL,
  background_color VARCHAR(20) NOT NULL DEFAULT '#026aa7',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  board_id INT NOT NULL,
  title VARCHAR(140) NOT NULL,
  position INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lists_board
    FOREIGN KEY (board_id) REFERENCES boards(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  list_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATETIME NULL,
  archived BOOLEAN DEFAULT FALSE,
  position INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cards_list
    FOREIGN KEY (list_id) REFERENCES lists(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS labels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  board_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL,
  CONSTRAINT fk_labels_board
    FOREIGN KEY (board_id) REFERENCES boards(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS card_labels (
  card_id INT NOT NULL,
  label_id INT NOT NULL,
  PRIMARY KEY (card_id, label_id),
  CONSTRAINT fk_card_labels_card
    FOREIGN KEY (card_id) REFERENCES cards(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_card_labels_label
    FOREIGN KEY (label_id) REFERENCES labels(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS card_members (
  card_id INT NOT NULL,
  member_id INT NOT NULL,
  PRIMARY KEY (card_id, member_id),
  CONSTRAINT fk_card_members_card
    FOREIGN KEY (card_id) REFERENCES cards(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_card_members_member
    FOREIGN KEY (member_id) REFERENCES members(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  title VARCHAR(140) NOT NULL,
  position INT NOT NULL,
  CONSTRAINT fk_checklists_card
    FOREIGN KEY (card_id) REFERENCES cards(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  checklist_id INT NOT NULL,
  content VARCHAR(240) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  position INT NOT NULL,
  CONSTRAINT fk_checklist_items_checklist
    FOREIGN KEY (checklist_id) REFERENCES checklists(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

