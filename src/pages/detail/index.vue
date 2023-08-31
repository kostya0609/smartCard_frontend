<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="detail-header">
      <returnButton/>
    </div>

    <el-tabs type="border-card" v-model="page">
      <el-tab-pane v-for="(item, key) in menu" :label="item" :name="key" :key="key">
      </el-tab-pane>
      <smartCard          v-if="page === 'smartCard'            && !loading" v-model:value="smartCard"/>
      <tasks              v-if="page === 'tasks'                && !loading" :kind="smartCard.kind" :type_id="smartCard.type_id"/>
      <indicators         v-if="page === 'indicators'           && !loading && smartCard.kind === 'card'" :typeId="smartCard.type_id"/>
      <additionalOptions  v-if="page === 'additionalOptions'    && !loading && smartCard.kind === 'card'" :approver="smartCard.approver"/>
      <businessProcess    v-if="page === 'businessProcess'      && !loading" v-model:value="smartCard"/>
      <logs               v-if="page === 'logs'                 && !loading" :typeId="smartCard.type_id"/>
    </el-tabs>

    <el-link
        href="/knowledge/instrukcii/rabotasfmsmartkart/"
        target="_blank"
        type="danger"
        style="margin-top: 25px"
    >
      Актуальная инструкция по работе со SMART картами.
    </el-link>

  </div>
</template>

<script>
import {ref, reactive, inject, provide} from 'vue';
import returnButton from "../../components/return_button";

import smartCard from "./components/smart_card";
import tasks from "./components/tasks";
import indicators from "./components/indicators";
import additionalOptions from "./components/additional_options";
import businessProcess from "./components/business_process";
import logs from "../../components/logs";

import { useRouter, useRoute } from 'vue-router';


export default {
  name: "detailIndex",
  components:{returnButton, smartCard, tasks, indicators, additionalOptions, businessProcess, logs},
  setup(){
    const route               = useRoute();
    const router              = useRouter();
    const svg                 = inject('svg');
    const notify              = inject('notify');
    const loadJson            = inject('loadJson');
    const userId              = inject('userId');
    const userRole            = inject('userRole');
    const full_access         = inject('full_access');
    const smartCardId         = inject('smartCardId');
    const smartCardStatus     = inject('smartCardStatus');
    let processId             = inject('processId');
    processId.value = null;

    const loading             = ref(false);
    smartCardId.value         = route.params.id

    const page                = ref(route.params.activeTab ? route.params.activeTab : 'smartCard');
    provide('page', page);

    const weights             = ref(null);
    provide('weights', weights);

    const valuation           = ref(null);
    provide('valuation', valuation);

    let processStatusCard   = {
      created           : 3,
      approving         : 3,
      working           : 3,
      report_prepare    : 4,
      report_approving  : 4,
      report_completed  : 4,
      completed         : 4,
    };
    provide('processStatusCard',processStatusCard);

    let processStatusPlan   = {
      created           : 5,
      approving         : 5,
      completed         : 5,
    };
    provide('processStatusPlan', processStatusPlan);

    const smartCard           = reactive({});

    const menu                = reactive({
      smartCard         : 'SMART-карта',
      tasks             : 'Задачи',
      indicators        : 'KPI',
      additionalOptions : 'Дополнительные параметры',
      businessProcess   : 'Бизнес процесс',
      logs              : 'История изменений',
    });

    async function getData(){
      loading.value = true;
      //ниже получили основные данные по SMART-карте
      let result = await loadJson('/smart-card/get', {smartcard_id : smartCardId.value, user_id : userId.value});

      if (result.status === 'success') {
        //ниже если перешли в не санкционированно перешли не в свою смарт карту и получили пустую дату, то выкинуть в общий список
        if(!result.data || result.data.length === 0){
          router.push({name : 'listAll'})
          return;
        };

        valuation.value = result.data.valuation ? result.data.valuation : null;
        smartCardStatus.value = result.data.status;
        let keys = Object.keys(result.data);
        keys.forEach(key => {smartCard[key] = result.data[key]});

        if(smartCard.kind === 'plan'){
          delete menu.indicators; //если вид SMARTа это план, то нет KPI и нет доп. параметров...и в таком варианте вкладка будет на своем месте после задач а не в конце
          delete menu.additionalOptions;
        }
        //ниже проверка на full_access
        if(userRole.includes('admin') || userId.value == result.data.executor.value) full_access.value = true;
          else result.data.full_access ? full_access.value = true : full_access.value = false;

      } else notify('Ошибка получения информации по SMART-карте', `При получении основной информации по SMART-карте возникла ошибка!`, 'error');

      //ниже, если это SMART-карта,  показать кнопку принять к оплате расчетчику и для согласовантов/утвержданта отчета открыть поля во вкладке доп. параметры

      if (['report_approving','report_completed'].includes(smartCardStatus.value) && smartCard.kind === 'card' ){
        result = await loadJson('/process/get-process-doc', {document_id: smartCardId.value, process_id: processStatusCard[smartCardStatus.value]});
        if (result.status === 'success' && result.data) {
          if (result.data.stage_current_users) {
            let allow = result.data.stage_current_users.filter(el => {
              return el.user == userId.value
            })[0] ? true : false;
            smartCard.approver   = (smartCardStatus.value==='report_approving' && allow) ? true : false;
            smartCard.calculator = (smartCardStatus.value==='report_completed' && allow) ? true : false;
          }
        }
      }

      //ниже надо отслеживать общий вес задач weights
        result = await loadJson('/smart-card/tasks/weights', {user_id: userId.value, smartcard_id: smartCardId.value})
        if (result.status == 'success' && result.data) {
          weights.value = null;
          result.data.forEach(el => weights.value = weights.value + el.weight)
        } else notify('Ошибка получения информации по SMART-карте', `При получении общего веса задач по SMART-карте возникла ошибка!`, 'error');

      loading.value = false;

    };
    getData()
    return{
      svg, loading, page, menu, smartCard, smartCardId,
    }
  },
}

</script>

<style scoped>

</style>