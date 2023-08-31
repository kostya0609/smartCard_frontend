<template>
  <div
    v-loading="loading"
    element-loading-text="Загрузка данных..."
    :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
    class="app_container"
  >
    <Process
      v-if="!errors.valuation && !errors.indicators && !errors.weights && !errors.fact"
      :config="configProcess"
      @process="getProcess"
    />

    <h3 v-else class="weight-red">
      Согласование невозможно.
      {{errors.weights}}
      {{errors.indicators}}
      {{errors.valuation}}
      {{errors.fact}}
    </h3>

    <el-row v-if="isAdmin">
      <el-button
          v-if="smartCardStatus === 'working' || smartCardStatus === 'report_prepare'|| smartCardStatus === 'report_completed'"
          class="change-status"
          @click="changeStatus('created')"
      >
        Перевести в статус "Подготовка плана"
      </el-button>

      <el-button
          v-if="(smartCardStatus === 'report_completed' || smartCardStatus === 'report_prepare') && value.kind === 'card'"
          class="change-status"
          @click="changeStatus('report_prepare')"
      >
        Перевести в статус "Подготовка отчета"
      </el-button>

    </el-row>

  </div>
</template>

<script>

import {ref, provide, inject, reactive, computed} from 'vue';
import Process from '@/process/Process.vue'
import { useRoute } from 'vue-router';

export default {
  name: "business_process",
  props: ['value'],
  components: {Process},
  setup(props) {
    const route             = useRoute();
    const loadJson          = inject('loadJson');
    const notify            = inject('notify');
    const userId            = inject('userId');
    const userRole          = inject('userRole');
    const smartCardId       = inject('smartCardId');
    const smartCardStatus   = inject('smartCardStatus');
    const svg               = inject('svg');
    let weights             = inject('weights');
    const monthList         = inject('monthList');
    const full_access       = inject('full_access');

    const processStatusCard = inject('processStatusCard');
    const processStatusPlan = inject('processStatusPlan');

    const loading           = ref(false);
    provide('loading', loading);//для модуля согласования

    let processId           = inject('processId');
    processId.value = props.value.kind === 'card' ? processStatusCard[smartCardStatus.value] : processStatusPlan[smartCardStatus.value];
    
    let configProcess = reactive({
      process_id  : processId,
      document_id : route.params.id,      
      user        : userId.value,
      subtitle    :[],// ['Инициатор: Марусина Алена Владимировна, Специалист по адаптации персонала', 'Поручения']
      full_access : full_access.value,
      data_notify : { //данные для формирования уведомления
        id            : route.params.id,
        period_type   : props.value.period_type === 'month' ? 'месяц' : 'квартал',
        period_value  : props.value.period_type === 'month' ? monthList.find(el => {return el.value === props.value.period_value}).label : props.value.period_value,
        year          : props.value.year,
        executor      : props.value.executor.label,
      }
    })

    let errors = reactive({
      valuation   : null,
      indicators  : null,
      weights     : null,
      fact        : null,
    });

    const isAdmin   = computed(() => {
      return userRole.includes('admin');
    })

    async function checkValuation(){
      loading.value = true;
      let result = await loadJson('/smart-card/tasks/check', {
        smartcard_id : smartCardId.value,
        user_id      : userId.value,
      });
      loading.value = false;

      if (result.status === 'error') errors.valuation = 'Необходимо проверить оценки выполнения задач.';
    };

    async function checkIndicators(){
      loading.value = true;
      let result = await loadJson('/smart-card/indicator/get-value',  {
        type_id        : props.value.type_id,
        smartcard_id   : smartCardId.value,
        user_id        : userId.value
      });
      loading.value = false;

      if (result.status =='success' && result.data) {
        if (smartCardStatus.value === 'created') {
          result.data.forEach(el => {
            if (el.plan === '') errors.indicators = 'Необходимо заполнить план KPI.';
          })
        }
        if (smartCardStatus.value === 'report_prepare' ) {
          result.data.forEach(el => {
            if (el.fact === null) errors.indicators = 'Необходимо заполнить факт KPI.';
          })
        }
      }
    };

    async function checkFact(){
      loading.value = true;
      //запрашивая веса там еще и приходят факт заполнения по каждой задачи
      let result = await loadJson('/smart-card/tasks/weights', {user_id: userId.value, smartcard_id: smartCardId.value})
      loading.value = false;
      if (result.status == 'success' && result.data) {
        result.data.forEach(el => el.fact == null ? errors.fact = 'Необходимо заполнить факт выполнения у каждой задачи.' : '' )
      }
    };

    if( (smartCardStatus.value === 'created' || smartCardStatus.value === 'report_prepare') && props.value.kind === 'card') checkIndicators();

    if (smartCardStatus.value === 'report_prepare') checkValuation();

    if (smartCardStatus.value === 'report_prepare') checkFact();

    if (weights.value !== 100) {errors.weights = `Суммарный вес задач в SMART-карте должен быть равен 100%. Сейчас ${weights.value ? weights.value : 0}%.`};

    async function getProcess(item){
        let status = {
          //статусы SMART-карты
          7  : 'approving',
          10 : 'approving',
          9  : 'working',
          12 : 'report_approving' ,
          13 : 'report_approving',
          15 : 'report_completed',
          14 : 'completed',
          // статусы плана
          17 : 'approving',
          18 : 'completed'
        };

      //обновляем текущих согласовантов/утверждантов
      let result = await loadJson(
          '/smart-card/actions/update',{
            user_id: userId.value,
            smartcard_id: smartCardId.value,
            users_id : item.stage_current_users ? item.stage_current_users : []}
      );

      //ниже если нет или есть подписант плана но другой
      if (!props.value.plan_signatory && item.stages_users && item.stages_users['6'] ||
          item.stages_users && item.stages_users['6'] && props.value.plan_signatory !== item.stages_users['6'][0].user) {

        props.value.plan_signatory = item.stages_users['6'][0].user;
        loading.value = true;
        let result = await loadJson('/smart-card/edit', {
          smartcard_id : smartCardId.value,
          user_id      : userId.value,
          ...props.value
        });
        loading.value = false;
        if (result.status !== 'success')
          notify('Ошибка при изменеии подписанта плана', `При изменении подписанта плана по SMART-карте возникла ошибка!`, 'error');
      }

      //ниже если нет или есть подписант отчета но другой
      if (!props.value.report_signatory && item.stages_users && item.stages_users['8'] ||
          item.stages_users && item.stages_users['8'] && props.value.report_signatory !== item.stages_users['8'][0].user) {

        props.value.report_signatory = item.stages_users['8'][0].user;
        loading.value = true;
        let result = await loadJson('/smart-card/edit', {
          smartcard_id : smartCardId.value,
          user_id      : userId.value,
          ...props.value
        });
        loading.value = false;
        if (result.status !== 'success')
          notify('Ошибка при изменеии подписанта отчета', `При изменении подписанта отчета по SMART-карте возникла ошибка!`, 'error');
      }

      //ниже если прошло аннулирование процесса надо статусы вернуть на предыдущие
      if(!item.status_current && ['approving', 'report_approving', 'report_completed'].includes(smartCardStatus.value)){
        let new_status = smartCardStatus.value === 'approving' ? 'created' : 'report_prepare';
        loading.value = true;
        let result = await loadJson('/smart-card/change-status', {
          smartcard_id : smartCardId.value,
          user_id      : userId.value,
          status       : new_status,
        });
        loading.value = false;
        if (result.status == 'success') {
          smartCardStatus.value = new_status;
        } else notify('Ошибка при аннулировании', `При аннулировании процесса согласования/утверждения плана/отчета по SMART-карте возникла ошибка!`, 'error');
      };

      //обновляем статус SMART катры от модуля согласования если прошло изменение
      if (status[item.status_current] && smartCardStatus.value != status[item.status_current]) {
        loading.value = true;
        let result = await loadJson('/smart-card/change-status', {
          smartcard_id : smartCardId.value,
          user_id      : userId.value,
          status       : status[item.status_current]
        });
        loading.value = false;
        if (result.status == 'success') {
          smartCardStatus.value = status[item.status_current];
        } else notify('Ошибка при изменении статуса', `При изменении статуса у SMART-карты возникла ошибка!`, 'error');
      };

    }

    async function changeStatus(status){
      let process_id = [4];

      if(props.value.kind === 'card'){
        status === 'created' ? process_id.push(3) : ''
      } else
          process_id = [5]

      loading.value = true;
      let result = await loadJson('/process/delete-process', {
        process_document_id : smartCardId.value,
        module_name         : 'SmartCards',
        process_id,
      })
      loading.value = false;

      if (result.status === 'success') {
        loading.value = true;

        await loadJson('/smart-card/actions/update',{
          user_id      : userId.value,
          smartcard_id : smartCardId.value,
          users_id     : []
        });

        let result = await loadJson('/smart-card/change-status', {
          smartcard_id : smartCardId.value,
          user_id      : userId.value,
          status,
        });
        loading.value = false;

        if (result.status == 'success') {
          smartCardStatus.value = status;
          window.location.reload();
        }
      }
    };

    return {processId, userId, route, svg, loading, smartCardId, smartCardStatus, errors, getProcess, configProcess, isAdmin, changeStatus}
  },

}
</script>

<style scoped>

</style>