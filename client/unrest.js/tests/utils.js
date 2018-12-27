export const testText = s =>
  expect(document.querySelector('test-tag').innerText.trim()).to.equal(s)
