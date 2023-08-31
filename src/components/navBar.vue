<template>
  <div>
    <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        :router=true
    >
      <template v-for="(item, key) in menu" :key="key">
        <el-menu-item :index="item.path"> {{item.text}} </el-menu-item>
        <span v-if="item.text == 'Требует вашей реакции' && needActions" style="position: relative"><span class="badgeItem"> {{needActions}}</span></span>
      </template>

      <el-menu-item  class="menu-right-element" :index="rightButtonIndex">
        <el-button class="menu-right-element-button">
          Добавить {{rightButtonLabel}}
        </el-button>
      </el-menu-item>
    </el-menu>
  </div>

</template>

<script>

import {ref, reactive, inject, watchEffect, provide, computed} from "vue";
import {useRoute} from 'vue-router'

export default {
  name: "navBar",
  setup(){
    const userRole = inject('userRole')
    const loadJson = inject('loadJson');
    const userId   = inject('userId');

    const loading  = ref(false);
    const route    = useRoute()
    const menu     = reactive([
      {path : '/smart_card/list_all',         text : 'SMART-карты'},
      {path : '/smart_card/list_attention',   text : 'Требует вашей реакции'},
      userRole.indexOf('admin') >= 0 ? {path : '/smart_card/access',  text : 'Права доступа'} : '',
      userRole.indexOf('admin') >= 0 ? {path : '/smart_card/types',   text : 'Типы SMART-карт'} : '',
      userRole.indexOf('admin') >= 0 ? {path : '/smart_card/task_templates',   text : 'Шаблоны задач'} : '',
    ]);
    const activeIndex = ref(null);
    const needActions = ref('');
    provide('needActions', needActions);

    const rightButtonIndex = computed(() => {
      if (activeIndex.value === '/smart_card/list_all' || activeIndex.value === '/smart_card/list_attention') return '/smart_card/smart_card_add'
      if (activeIndex.value === '/smart_card/access') return '/smart_card/user_add'
      if (activeIndex.value === '/smart_card/types') return '/smart_card/type_add'
      if (activeIndex.value === '/smart_card/task_templates') return '/smart_card/task_templates_add'

    })
    const rightButtonLabel = computed(() => {
      if (activeIndex.value === '/smart_card/list_all' || activeIndex.value === '/smart_card/list_attention') return 'SMART-карту'
      if (activeIndex.value === '/smart_card/access') return 'пользователя'
      if (activeIndex.value === '/smart_card/types') return 'тип'
      if (activeIndex.value === '/smart_card/task_templates') return 'шаблон'
    })

    async function getData(){
      loading.value = true;
      let result = await loadJson('/smart-card/actions/badge', {user_id: userId.value })
      loading.value = false;
      if (result.status == 'success' && result.data) needActions.value = result.data.count; else needActions.value = '';
    };
    getData();

    watchEffect(() => { activeIndex.value = route.path })

    return{ activeIndex, menu, needActions, rightButtonIndex,rightButtonLabel}
  },
}
</script>

<style scoped>

</style>