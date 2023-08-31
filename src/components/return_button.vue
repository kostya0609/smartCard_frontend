<template>
  <el-button class="returnButton" @click="goBack">Вернуться назад</el-button>
</template>
<script setup>

import { useRouter, useRoute } from 'vue-router';
import {inject} from "vue";
const router      = useRouter();
const route       = useRoute();
const smartCardId = inject('smartCardId');

function goBack(){
  if(!router.previous) {
    router.push({name:'listAll'});
    return;
  }

  if(router.previous == 'access') {router.push({name:'access'});return};

  if (router.previous !== 'detail') {
    if(router.previous == 'listAttention') {router.push({name:'listAttention'}); return;};
    if(router.previous == 'types') {router.push({name:'types'}); return;};
    if(router.previous == 'taskTemplates') {router.push({name:'taskTemplates'}); return;};
    router.push({name:'listAll'})
  }
  else {route.name === 'smartCardEdit' ? router.push({name:'detail', params: { id: smartCardId.value }}) :
      router.push({name:'detail', params: { id: smartCardId.value, activeTab : 'tasks' }})} //если нажали вернуться назад находясь на добавлении/редактировании задач
};

</script>

<style scoped>

</style>