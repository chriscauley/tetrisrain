/* Unrest schema definition
   {
     name: string, // required, literally input[name]
     type: string, // required, analogous to input[type]
     value: any, // intial value for input[value]
   }
   An unrest schema object asks "What would this look like in the database"
*/
import config from "./config"
import prep from "./prep"
import unslugify from "./unslugify"

export default {
  config,
  prep,
  unslugify,
}