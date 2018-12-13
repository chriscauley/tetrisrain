/* Unrest schema definition
   {
     name: string, // required, literally input[name]
     type: string, // required, analogous to input[type]
     value: any, // intial value for input[value]
   }
   An unrest schema object asks "What would this look like in the database"
*/
import fromConstructor from "./fromConstructor"
import fromObject from "./fromObject"
import unslugify from "./unslugify"

export default {
  fromConstructor,
  fromObject,
  unslugify,
}