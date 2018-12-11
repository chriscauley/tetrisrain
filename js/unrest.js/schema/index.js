/* Unrest schema definition
   {
     name: string, // required, literally input[name]
     type: string, // required, analogous to input[type]
     value: any, // intial value for input[value]
     tagName: string, // riot tag to mount, defaults to ur-input
     input_type: string, // used by ur-input, overrides to field.type
     input_tagname, // used by ur-input, "input|textarea|select"
   }
*/
import fromObject from "./fromObject"

export default {
  fromObject,
}