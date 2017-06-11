# -*- coding: UTF-8 -*-

import json

#
# Tree structure:
#
# {
#   ($prompt$, $action$): [
#     ($option$, $subtree$)
#   ]
# }
#
# The prompt/action line specificies, if I give the user this prompt, what action should I take on the response? There are two types of actions:
# (a) the user will give me something, I will act on it, and enter a new tree (in this case the array is empty)
# (b) the user has a set of options to reply with (as buttons, quick reply, etc), each of which will trigger a new prompt. If the response is not in the options, the prompt can be repeated or default to a different tree.
#
# Actions:
# - buttons: type b, options are template buttons
# - search: type a, takes response as search query
################################

greeting_tree = {
  ("🐵 I'm Madeleine! 😀 \nGreat to meet you!\n\nI know things might be confusing for you or scary, but I know quite a lot about reproductive health so don't worry! I can help you by answering questions, giving hygiene product recommendations, or connecting you with local resources! I'm also multi-lingual! What would you like to do?", "buttons"): [
    ("I have a question", {
      ("🐵 Great, try asking me a question!\nI can answer something like 'What is a STD?'\nYou can also discover new questions by saying 'Show me random questions!'\nGo for it!", "search"): []
    }),
    ("My hygiene product?", {
      ("🐵 Ok! I'm going to ask you a few questions to see what product is best for you. I know it's hard to figure out which one works best for you! Do you like to exercise during your period?", "buttons"): [
        ("Yes", {
          ("Great! 🙉 You will be most comfortable going with tampons since they make it easier for you to move around, especially if you want to swim. Check out Local Resources to find out where you can get tampons near you!", "buttons"): [
            ("Local resources", {
              ("What specifically are you looking for?🙊", "image_search"): []
            })
          ]
        }),
        ("No", {
          ("And how would you describe your menstrual flow? 🙊 I know it's scary to have a lot of blood come out of your body at once.", "buttons"): [
            ("Heavy", {
              ("Finally, how comfortable are you with your body? 🙊", "buttons"): [
                ("Not comfortable", {
                  ("No problem! 🙉 Your best choice is to go with pads! They are super easy to put on and also can hold a lot of blood. Check out Local Resources to find out where you can get pads near you!", "search"): [
                    ("Local resources", {
                      ("What specifically are you looking for?🙊", "image_search"): []
                    })
                  ]
                }),
                ("Comfortable", {
                  ("Great! 🙉 Your best choice is to go with tampons! They make it easy for you to move around after you learn how to put them on! Check out Local Resources to find out where you can get tampons near you.", "search"): [
                    ("Local resources", {
                      ("What specifically are you looking for?🙊", "image_search"): []
                    })
                  ]
                })
              ]
            }),
            ("Light", {
              ("Great! 🙉 You will be most comfortable going with panty liners! They can catch a lot of blood and stay very well! Check out Local Resources to find out where you can get panty liners near you.", "search"): [
                ("Local resources", {
                  ("What specifically are you looking for?🙊", "image_search"): []
                })
              ]
            })
          ]
        })
      ]
    }),
    ("Local resources", {
        ("🐵 Let's check out what resources are available in your local area! I'm going to ask you a few questions. First, what country are you in?", "buttons"): [
            ("Jordan", {
              ("🐵 Okay, great! And what settlement are you in?", "buttons"): [
                ("Zaatari", {
                  ("Okay! Some of the organizations in your area are:\nReproductive Health (UNFPA), Gender-Based Violence (UNHCR), Core Relief Items (CRIs) (PWJ), Health (WHO). Try reaching out to these groups!\n\nWhat specifically are you looking for?🙊", "image_search"): []
                }),
                ("Mrajeeb Al Fhood", {
                  ("What specifically are you looking for?🙊", "image_search"): []
                }),
                ("Azraq", {
                  ("What specifically are you looking for?🙊", "image_search"): []
                })
                #("Hadallat", {
                #   ("What specifically are you looking for?🙊", "image_search"): []
                #})
                # ("Rukban", {
                #   ("What specifically are you looking for?🙊", "image_search"): []
                # })
              ]
            }),
            ("Turkey", {
              ("What specifically are you looking for?🙊", "image_search"): []
            }),
            ("Lebabnon", {
              ("What specifically are you looking for?🙊", "image_search"): []
            })
        ]
    })
  ]
}



################################

trees = {
  "greeting": greeting_tree
}

################################
# flat data structure:
prompts = {} # pid -> [prompt, action, [child oid's]]
options = {} # oid -> [option, child pid]

for name in trees.keys():
  subtrees = [(trees[name], name + '-p0')]
  pcounter = 1
  ocounter = 0

  while subtrees:
    [subtree, pid] = subtrees.pop()
    key = subtree.keys()[0]
    prompt = [key[0], key[1], []]

    for option in subtree[key]:
      oid = name + '-o' + str(ocounter)
      new_pid = name + '-p' + str(pcounter)
      ocounter += 1
      pcounter += 1

      options[oid] = [option[0], new_pid]
      subtrees.append([option[1], new_pid])
      prompt[2].append(oid)

    prompts[pid] = prompt

json.dump(prompts, open('prompts.json', 'w'), indent=2, sort_keys=True)
json.dump(options, open('options.json', 'w'), indent=2, sort_keys=True)
