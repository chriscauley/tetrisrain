/* Returns a list of [value,label] pairs
   Usage:
   parseChoices([1,2,[3,'three']]) => [[1,1],[2,2],[3,'three']]
*/

import slugify from "slugify"

export default (choices) => {
  if (typeof choices == "function") { choices = choices() }
  return choices.map(c => {
    const type = typeof(c)
    if (type === "undefined") { return ["","None"] }
    if (type === "string" || type === "number") { return [c,c] }
    return c
  })
}

// #! TODO This should eventually accomodate groupings as well like:
// choices = [["group_name",[choice1,choice2,choice3]...],group2,group3]

// #! TODO Maybe this should be broken out into multiple functions?
// I can see use cases where someone wants any of these
// choices.slugify([a,b]) => [[slugify(a),a],[slugify(b),b]]
// choices.noop([a,b]) => [[a,a],[b,b]]
// choices.unslugify([a,b]) => [[a,unslugify(a)],[b,unslugify(b)]]