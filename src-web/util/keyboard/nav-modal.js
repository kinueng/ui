/*****************************************************************
 *
 * Copyright 2019 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *****************************************************************/

'use strict'

export const navModalKeyboard = (e, data) => {
  e.persist()
  e.stopPropagation()

  const { menuItems, fields, active } = data
  const click = new MouseEvent('click', { 'bubbles': true, 'cancelable': true })

  if (e.target.className === 'menu-item') {
    e.preventDefault()

    switch(e.which) {
    case 40:  // down
      for (let i = 0; i < menuItems.length - 1; i++) {
        if (e.target === menuItems[i]) {
          menuItems[i + 1].focus()
          break
        }
      }
      break

    case 38:  // up
      for (let i = menuItems.length - 1; i > 0; i--) {
        if (e.target === menuItems[i]) {
          menuItems[i - 1].focus()
          break
        }
      }
      break

    case 9:  // tab
    case 39:  // right
      fields[0].focus()
      break

    case 32:  // space
    case 13:  // enter
      e.target.dispatchEvent(click)
      break

    case 36:  // home
      menuItems[0].focus()
      break

    case 35:  // end
      menuItems[menuItems.length - 1].focus()
      break
    }
  } else {
    switch(e.which) {
    case 37:  // left
      active.focus()
      break

    case 36:  // home
      fields[0].focus()
      break

    case 35:  // end
      fields[fields.length - 1].focus()
    }
  }
}
