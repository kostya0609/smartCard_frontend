<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="options-container">
      <el-row>
        <el-col :span="4">
          <label class="options-label">Премия</label>
        </el-col>
        <el-col :span="4">
          <el-input
              v-model="options.premium"
              class="options-element"
              placeholder="Введите значение"
              :disabled="!approver"
              :formatter="(value) => value.replace(/[^\d.]/ig, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')"
          ></el-input>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4">
          <label class="options-label">Штрафы</label>
        </el-col>
        <el-col :span="4">
          <el-input
              v-model="options.fine"
              class="options-element"
              placeholder="Введите значение"
              :disabled="!approver"
              :formatter="(value) => value.replace(/[^\d.]/ig, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')"
          ></el-input>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4">
          <label class="options-label">ККР_1</label>
        </el-col>
        <el-col :span="4">
          <el-input
              v-model="options.kkp_1"
              @change="options.kkp_1 = parseFloat(options.kkp_1)"
              class="options-element"
              placeholder="Введите значение"
              :disabled="!approver"
          ></el-input>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4">
          <label class="options-label">ККР_2</label>
        </el-col>
        <el-col :span="4">
          <el-input
              v-model="options.kkp_2"
              @change="options.kkp_2 = parseFloat(options.kkp_2)"
              class="options-element"
              placeholder="Введите значение"
              :disabled="!approver"
          ></el-input>
        </el-col>
      </el-row>

      <div class="options-footer">
        <el-button
            v-if="approver"
            class="options-footer-button"
            @click="saveOptions"
        >
          Сохранить
        </el-button>
      </div>
    </div>

  </div>
</template>

<script>

import {reactive, inject, ref, watch} from "vue";

export default {
  name: "additional_options",
  props: ['approver'],
  setup(){
    const loadJson        = inject('loadJson');
    const notify          = inject('notify');
    const userId          = inject('userId');
    const svg             = inject('svg');
    const smartCardId     = inject('smartCardId');
    const smartCardStatus = inject('smartCardStatus');

    const loading         = ref(false);
    let options           = reactive({
      premium : '',
      fine    : '',
      kkp_1   : '1',
      kkp_2   : '1',
    })

    async function getData(){
      loading.value = true;
      let result = await loadJson('/smart-card/options/get', {smartcard_id : smartCardId.value});
      loading.value = false;
      if (result.status === 'success' && result.data) {
        options.premium = result.data.premium ? String(result.data.premium).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
        options.fine    = result.data.fine ? String(result.data.fine).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
        options.kkp_1   = result.data.kkp_1;
        options.kkp_2   = result.data.kkp_2;
      };
    }
    getData();

    async function saveOptions(){
      loading.value = true;
      let result = await loadJson('/smart-card/options/set',  {
        premium       : options.premium.replace(/\s/g,""),
        fine          : options.fine.replace(/\s/g,""),
        kkp_1         : options.kkp_1,
        kkp_2         : options.kkp_2,
        smartcard_id  : smartCardId.value,
        user_id       : userId.value
      });
      loading.value = false;
      notify('Дополнительные параметры', result.message, result.status);
    };

    watch([
       () => options.kkp_1,
       () => options.kkp_2,
    ], (values) => {
      (String(values[0]).replace(/[^\d.]/ig, '')) <= 1 ? options.kkp_1 = (String(values[0]).replace(/[^\d.]/ig, '')) : options.kkp_1 = null;
      (String(values[1]).replace(/[^\d.]/ig, '')) <= 1 ? options.kkp_2 = (String(values[1]).replace(/[^\d.]/ig, '')) : options.kkp_2 = null;

    })

    return{
      svg, loading, options, smartCardStatus,
      saveOptions
    }
  },
}
</script>

<style scoped>

</style>