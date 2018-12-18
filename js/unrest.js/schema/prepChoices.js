import parseChoices from './parseChoices'

export default opts => {
  return parseChoices(opts.choices).map((c, index) => ({
    value: c[0],
    label: c[1],
    id: opts.name + '__' + index,
  }))
}
