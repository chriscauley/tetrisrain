import _ from "lodash"
import Ease from 'pixi-ease'

export default uP => {
  const scale = uP.scale
  const ease_list = new Ease.list()
  _.merge(uP,{
    ease: (obj,props, time=uP.ANIMATION_TIME) => {
      ease_list.add(new Ease.to(obj, props, time))
    },

    easeXY: (obj,x,y) => {
      uP.ease(obj,{ x: scale * x, y: scale * y})
    },

    assign: (obj,props) => {
      _.assign(obj,props)
    }
  })
}