import _ from "lodash"

const base = { // bootstrap is default
  default: {
    outer: "card",
    header: "card-header",
    content: "card-body",
    footer: "card-footer",
  },
  modal: {
    mask: "modal-backgrop fade show",
    root: "modal",
    outer: "modal-dialog modal-content",
    header: "modal-header",
    content: "modal-body",
    footer: "modal-footer",
    header_title: "modal-title",
  },
  error: "alert alert-danger",
  table: "table table-striped table-hover",
  form: {
    field: "input-field",
    select: "browser-default",
  },
  btn: {
    default: "btn",
    primary: "btn btn-primary",
    success: "btn btn-success",
    cancel: "btn btn-error",
    warning: "btn bg-warning",
    group: "btn-group",
    group_block: "btn-group", // DNE for bootstrap
  },
}

const spectre = {
  modal: {
    mask: "modal-overlay",
    root: "modal active",
    outer: "modal-container",
    header_title: "modal-title h4",
  },
  form: {
    field: "form-group",
    input: "form-input",
    label: "form-label",
  },
  btn: {
    group_block: "btn-group btn-group-block",
  },
  error: "label label-error",
}

// #! TODO
// this needs to eventually look at link tags and decide on mixins
// maybe should be wrapped in uR.ready, but then importing in ThemeMixin is complicated
const css = {}
export default _.merge(css,base,spectre)