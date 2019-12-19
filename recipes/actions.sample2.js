var recipe = {
  action: {
    "test2": {
      "patterns": [
        "print $UpDown:updown"
      ],
      "response": "",
      "commandParams": {
        "direction": "$updown"
      },
      "types":[
        {
          "name": "$UpDown",
          "entities": [
            {
              "key": "UP",
              "synonyms": [
                "back",
                "upward"
              ]
            },
            {
              "key": "DOWN",
              "synonyms": [
                "downward",
                "forward"
              ]
            },
          ]
        }
      ]
    }
  },
}

exports.recipe = recipe // Don't remove this line.
