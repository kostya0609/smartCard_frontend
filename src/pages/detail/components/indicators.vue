<template>
  <div
      v-if="indicators.length > 0"
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="options-container">
      <el-row>
        <el-col :span="4"/>
        <el-col :span="4">
          <label>План</label>
        </el-col>
        <el-col :span="1"/>
        <el-col :span="4">
          <label>Факт</label>
        </el-col>

      </el-row>
      <el-row v-for="item in indicators">
        <el-col :span="4">
          <label class="options-label">{{item.name}}</label>
        </el-col>
        <el-col :span="4">
         <el-input
           v-model="valuesPlan[item.id]"
           :class="valuesPlan[item.id]? '' : 'invalid'"
           placeholder="Введите значение"
           :disabled="smartCardStatus!=='created' || !full_access"
           :formatter="(value) => value.replace(/[^\d.]/ig, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')"
         >
         </el-input>
        </el-col>
        <el-col :span="1"/>
        <el-col :span="4">
          <el-input
              v-model="valuesFact[item.id]"
              placeholder="Введите значение"
              :disabled="smartCardStatus!=='report_prepare' || !full_access"
              :formatter="(value) => value.replace(/[^\d.]/ig, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')"
          >
          </el-input>
        </el-col>
      </el-row>
      <div class="options-footer">
        <el-button
            v-if="(smartCardStatus==='created' || smartCardStatus==='report_prepare') && full_access"
            class="options-footer-button"
            @click="saveIndicators"
        >
          Сохранить {{smartCardStatus==='created' ? 'план' : 'факт'}}
        </el-button>
      </div>
    </div>
  </div>
  <p v-else>SMART-карты этого типа не имеют KPI</p>
</template>

<script>
import {inject, reactive, ref} from "vue";
export default {
  name: "indicators",
  props : ['typeId',],
  setup(props){
    const loadJson           = inject('loadJson');
    const svg                = inject('svg');
    const notify             = inject('notify');
    const userId             = inject('userId');
    const full_access        = inject('full_access');
    const smartCardId        = inject('smartCardId');
    const smartCardStatus    = inject('smartCardStatus');

    let loading              = ref(false);
    const indicators         = reactive([]);
    const valuesPlan         = reactive({});
    const valuesFact         = reactive({});

    async function getData(){
      let result = await loadJson('/smart-card/indicator/get-value',  {
        type_id        : props.typeId,
        smartcard_id   : smartCardId.value,
        user_id        : userId.value
      });
      if (result.status =='success' && result.data) {
        indicators.length = 0;
        result.data.forEach(el => {
          indicators.push(el);
          valuesPlan[el.id] = el.plan === null ? '' : String(el.plan).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
          valuesFact[el.id] = el.fact === null ? '' : String(el.fact).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        })
      }
    }
    getData()

    async function saveIndicators(){
      let toSend = [];
      indicators.forEach(el => {
        smartCardStatus.value === 'created' ? el.plan = valuesPlan[el.id] : el.fact = valuesFact[el.id];
        toSend.push({
          smartcard_id : smartCardId.value,
          indicator_id : el.id,
          value_id     : el.value_id,
          plan         : valuesPlan[el.id].replace(/\s/g,""),
          fact         : valuesFact[el.id].replace(/\s/g,""),
        })
      });
      loading.value = true;
      let result = await loadJson('/smart-card/indicator/set-value', {user_id : userId.value, values : toSend});
      loading.value = false;
      if (result.status =='success'){
        result = await loadJson('/smart-card/indicator/get-value',  {
          type_id        : props.typeId,
          smartcard_id   : smartCardId.value,
          user_id        : userId.value
        });
        if (result.status =='success' && result.data) {
          indicators.length = 0;
          result.data.forEach(el => { indicators.push(el) })
        }
      }
        notify('Сохранение значений KPI', result.message, result.status)
    };

    return {
      loading, svg, indicators, valuesPlan, valuesFact, smartCardStatus, full_access,
      saveIndicators,
    }
  },
}
</script>

<style scoped>

</style>