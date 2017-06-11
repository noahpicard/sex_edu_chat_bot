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
  ("🐵 I'm Madeliene!\nGreat to meet you!\n\nWhat are you interested in?\n1. I want to learn about sex\n2. I want to get hygiene products\n3. I want to find resources near me", "buttons"): [
    ("Learn about sex", {
      ("Ask me a question then!", "search"): []
    }),
    ("Get hygiene products", {
      ("[unimplmented] ask me a question instead", "search"): []
    }),
    ("Talk to a real person", {
      ("[unimplmented] ask me a question instead", "search"): []
    }),
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

json.dump(prompts, open('../prompts.json', 'w'), indent=2, sort_keys=True)
json.dump(options, open('../options.json', 'w'), indent=2, sort_keys=True)
