export const seedData = {
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
              description: "Finalize core assignment checklist.",
              labels: ["frontend"],
              dueDate: null,
              checklist: [
                { id: "ci1", text: "Board management", completed: true },
                { id: "ci2", text: "List/card drag and drop", completed: false }
              ],
              members: ["m1"]
            }
          ]
        },
        {
          id: "l2",
          title: "In Progress",
          cards: [
            {
              id: "c2",
              title: "Implement card details modal",
              description: "",
              labels: ["backend"],
              dueDate: null,
              checklist: [],
              members: ["m2"]
            }
          ]
        },
        {
          id: "l3",
          title: "Done",
          cards: []
        }
      ]
    }
  ]
};

