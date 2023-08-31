import { createRouter, createWebHistory } from 'vue-router'

import listAll from '../pages/list_all'
import listAttention from '../pages/list_attention'
import access from '../pages/access'
import types from '../pages/types'
import taskTemplates from '../pages/task_templates'

import detail from '../pages/detail'

import smartCardAdd from '../pages/smart_card_add'
import smartCardEdit from '../pages/smart_card_edit'

import taskAdd from '../pages/task_add'
import taskEdit from '../pages/task_edit'

import userAdd from '../pages/user_add'
import userEdit from '../pages/user_edit'

import typeAdd from '../pages/type_add'
import typeEdit from '../pages/type_edit'

const routes = [
  {
    path      : '/smart_card/list_all',
    name      : 'listAll',
    component : listAll,                      
    alias     : process.env.NODE_ENV == 'development' ? '/' : '/smart_card/list_all'
  },
  {
    path      : '/smart_card/list_attention',
    name      : 'listAttention',
    component : listAttention,
  },
  {
    path      : '/smart_card/access',
    name      : 'access',
    component : access,
  },
  {
    path      : '/smart_card/types',
    name      : 'types',
    component : types,
  },
  {
    path      : '/smart_card/task_templates',
    name      : 'taskTemplates',
    component : taskTemplates,
  },
  {
    path      : '/smart_card/task_templates_add',
    name      : 'taskTemplatesAdd',
    component : taskAdd,
  },
  {
    path      : '/smart_card/task_templates_edit/:id/:smartCardId/:smartCardStatus',
    name      : 'taskTemplatesEdit',
    component : taskEdit,
  },
  {
    path      : '/smart_card/detail/:id',
    name      : 'detail',
    component : detail,
  },
  {
    path      : '/smart_card/smart_card_add',
    name      : 'smartCardAdd',
    component : smartCardAdd,
  },
  {
    path      : '/smart_card/smart_card_edit/:id',
    name      : 'smartCardEdit',
    component : smartCardEdit,
  },
  {
    path      : '/smart_card/task_add/:id',
    name      : 'taskAdd',
    component : taskAdd,
  },
  {
    path      : '/smart_card/task_edit/:id/:smartCardId/:smartCardStatus/:type_id',
    name      : 'taskEdit',
    component : taskEdit,
  },
  {
    path      : '/smart_card/user_add',
    name      : 'userAdd',
    component : userAdd,
  },
  {
    path      : '/smart_card/user_edit',
    name      : 'userEdit',
    component : userEdit,
  },
  {
    path      : '/smart_card/type_add',
    name      : 'typeAdd',
    component : typeAdd,
  },
  {
    path      : '/smart_card/type_edit/:id',
    name      : 'typeEdit',
    component : typeEdit,
  },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  previous : null,
})

router.beforeEach((to, from, next) => {
  router.previous = from.name;
  !router.getRoutes().find(el => {return el.name === to.name + ''}) ? router.push({name : 'listAll'}) : '';
  next()
})

export default router
