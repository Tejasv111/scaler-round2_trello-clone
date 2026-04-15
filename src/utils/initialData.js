export const initialData = {
  active: 0,
  members: [
    { id: "m1", name: "Tejasv", avatar: "T" },
    { id: "m2", name: "Alex", avatar: "A" },
    { id: "m3", name: "Sara", avatar: "S" }
  ],
  boards: [
    {
      id: "b1",
      name: "My Trello Board",
      bgcolor: "#026aa7",
      lists: [
        {
          id: "l1",
          title: "To Do",
          cards: [
            {
              id: "c1",
              title: "Define MVP scope",
              description: "",
              labels: ["frontend"],
              dueDate: "",
              checklist: [],
              members: ["m1"]
            }
          ]
        },
        {
          id: "l2",
          title: "In Progress",
          cards: []
        }
      ]
    }
  ]
};

