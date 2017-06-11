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
  ("🐵 I'm Madeleine! 😀 \nGreat to meet you!\n\nI know things might be confusing for you or scary, but I know quite a lot about reproductive health so don't worry! I can help you by answering questions, giving an assessment, or connecting you with local resources! I'm also multi-lingual! What would you like to do?", "buttons"): [
    ("Question", {
      ("Ask me a question then! I can answer something like 'What is a STD?' for you!", "search"): []
    }),
    ("Assessment", {
      ("Ok! I'm going to ask you a few questions to see what product is best for you. Do you like to exercise during your period?", "buttons"): [
        ("Yes", {
          ("Great! You will be most comfortable going with tampons", "search"): []
        }),
        ("No", {
          ("No problem! You will be most comfortable going with pads", "search"): []
        })
      ]
    }),
    ("Local resources", {
        ("What specifically are you looking for?", "image_search"): []
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
