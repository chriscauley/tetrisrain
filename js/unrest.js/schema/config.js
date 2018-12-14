const isEven = value => {
  if (value%2) {
    throw `${value} is not even`
  }
}

export default {
  fields: {},
  type: {
    number: { type: 'number', validators: [isEven] },
  },
  name: {
  }
}