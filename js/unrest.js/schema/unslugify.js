/* uR.schema.unslugify usage:
   "this_is_a_slug" => "This Is A Slug"
   "ABC.xyz%$_()  asRt" => "Abc Xyz Arst"
*/

export default s => {
  if (typeof s != "string") { s = s.toString() }
  return s.replace(/[-_]/g," ").replace(/^(.)|\s(.)/g, ($1) => $1.toUpperCase());
} 