import _ from 'lodash'
import _uR from '../index' // necessary to trigger uR.ready
import _tt from './_test_tags.tag'

//import objectTests from './ObjectTests'
//import routerTests from './routerTests'
import authTests from './authTests'

window.location.hash = '#'

describe('uR.auth', authTests)
//describe('uR.router',routerTests)
//describe('uR.Object', objectTests)
