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

export const leftNavKeyboard = (e, data) => {
  e.persist()
  e.preventDefault()
  e.stopPropagation()

  const { secondary, opened, navigation, handleMenuClick, leftNav } = data
  const click = new MouseEvent('click', { 'bubbles': true, 'cancelable': true })

  switch(e.which) {
  case 9:  // tab
  case 27:  // esc
    handleMenuClick()
    break

  case 32:  // space
  case 13:  // enter
    e.target.dispatchEvent(click)
    break

  case 39:  // right
    e.target.className.includes('primary-nav-item') && e.target.dispatchEvent(click)
    break

  case 37:  // left
    if (secondary.includes(e.target)) {
      const isOpen = e.target.parentNode.parentNode.previousSibling.className.includes('open')
      isOpen && navigation[opened].dispatchEvent(click)
      navigation[opened].focus()
    }
    e.target.className.includes('open') && e.target.dispatchEvent(click)
    break

  case 38:  // up
    for (let i = navigation.length - 1; i > 0; i--) {
      if (navigation[i] === e.target) {
        navigation[i - 1].focus()
        break
      }
    }
    break

  case 40: // down
    if (e.target.id === leftNav.id) {
      navigation[0].focus()
      return
    }

    for (let i = 0; i < navigation.length - 1; i++) {
      if (navigation[i] === e.target) {
        navigation[i + 1].focus()
        break
      }
    }
    break

  case 36:  // home
    navigation[0].focus()
    break

  case 35:  // end
    navigation[navigation.length - 1].focus()
    break
  }
}
