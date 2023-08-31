<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="smartCardAdd-header">
      <h3>Подготовка SMART-карты</h3>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="4">
        <label class="smartCardAdd-label">Вид</label>
      </el-col>
      <el-col :span="4">
        <el-select
            v-model="newSmartCard.kind"
            :class="['smartCardAdd-element', {'invalid' : errors.kind}]"
            placeholder="Выберите вид"
        >
          <el-option
              v-for="item in kindList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.kind">{{errors.kind}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="smartCardAdd-label">Тип SMART-карты</label>
      </el-col>
      <el-col :span="4">
        <el-select
            v-model="newSmartCard.typeId"
            :class="['smartCardAdd-element', {'invalid' : errors.typeId}]"
            placeholder="Выберите тип"
            filterable
            :disabled="newSmartCard.kind !== 'card'"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.typeId">{{errors.typeId}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="smartCardAdd-label">Период</label>
      </el-col>
      <el-col :span="4">
        <el-select
            v-model="newSmartCard.period.type"
            class="smartCardAdd-element"
            placeholder="Установить период"
        >
          <el-option
            v-for="item in periodList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="1"></el-col>
      <el-col :span="4">
        <el-select
            v-model="newSmartCard.period.value"
            :class="['smartCardAdd-element', {'invalid' : errors.period}]"
            filterable
            placeholder="Параметр периода"
            :disabled="newSmartCard.period.type !== 'month' && newSmartCard.period.type !== 'quarter'"
        >
          <el-option
            v-for="item in periodParameterList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.period">{{errors.period}}</small>
      </el-col>
      <el-col :span="1"></el-col>
      <el-col :span="4">
        <el-select
            v-model="newSmartCard.period.year"
            :class="['smartCardAdd-element', {'invalid' : errors.year}]"
            placeholder="Установить год"
        >
          <el-option
            v-for="item in periodYearList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.year">{{errors.year}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="smartCardAdd-label">Исполнитель</label>
      </el-col>
      <el-col :span="9">
        <el-select
            v-model="newSmartCard.executor_id"
            @change="changeExecutor"
            :class="['smartCardAdd-element', {'invalid' : errors.executor_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="searchUser"
            placeholder="Исполнитель"
        >
          <el-option
              v-for="item in usersList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.executor_id">{{errors.executor_id}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="smartCardAdd-label">Департамент</label>
      </el-col>
      <el-col :span="9">
        <el-select
            v-model="newSmartCard.department_id"
            :class="['smartCardAdd-element', {'invalid' : errors.department_id}]"
            placeholder='При загрузке формы не получен департамент . Обратитесь в тех.поддержку'
            disabled
        >
          <el-option
              v-for="item in departmentList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.department_id">{{errors.department_id}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="smartCardAdd-label">Примечание</label>
      </el-col>
      <el-col :span="9">
        <el-input
            v-model="newSmartCard.comment"
            type="textarea"
            rows="5"
            placeholder="Поле для ввода текста"
        ></el-input>
      </el-col>
    </el-row>

    <div class="smartCardAdd-footer">
      <el-button
          class="smartCardAdd-footer-button"
          @click="saveSmartCard"
      >
        Сохранить
      </el-button>
    </div>

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

import returnButton from "../../components/return_button";
import {reactive, watch, watchEffect, inject, ref} from "vue";
import { useRouter } from 'vue-router';

export default {
  name: "smartCardAddIndex",
  components: {returnButton},
  setup(){
    const loadJson        = inject('loadJson');
    const notify          = inject('notify');
    const userId          = inject('userId');
    const userFIO         = inject('userFIO');
    const userDepartment  = inject('userDepartment');
    const svg             = inject('svg');
    const smartCardId     = inject('smartCardId', null);

    const kindList        = inject('kindList');
    const typeList        = inject('typeList');
    const monthList       = inject('monthList');
    const quarterList     = inject('quarterList');
    const periodList      = inject('periodList');

    const loading             = ref(false);
    const router              = useRouter();
    const newSmartCard        = reactive({
      kind         : null,
      typeId       : null,
      period       : {
        type  : null,
        value : null,
        year  : new Date().getFullYear(),
      },
      executor_id   : userId.value ? userId.value : null,
      department_id : userDepartment.value ? userDepartment.value : null,
      comment     : null,
    });

    const periodParameterList = reactive([]);
    const departmentList      = reactive([{value : userDepartment.value, label : userDepartment.label}]);

    let currentYear           = new Date().getFullYear();
    const periodYearList      = reactive([
      {value : currentYear - 1, label : (currentYear - 1).toString()},
      {value : currentYear,     label : (currentYear).toString()},
      {value : currentYear + 1, label : (currentYear + 1).toString()},
    ]);

    const usersList           = reactive([]);
    if (userId.value && userFIO.value) usersList.push({value : userId.value, label : userFIO.value});

    const errors              = reactive({
      kind          : null,
      typeId        : null,
      period        : null,
      year          : null,
      executor_id   : null,
      department_id : null,
    });

    function searchUser(query){
      let url = '/smart-card/search/user';
      if (query !== '')
        search(query,'user', url);
    };

    async function search(query, key, url){
      let result = await loadJson(url, {q: query});
      if (result.status === 'success') {
        if (key === 'user') {
          usersList.length = 0;
          result.data.forEach(el => usersList.push(el));
        };
      };
    };

    async function changeExecutor(){
      let result = await loadJson('/smart-card/get-user', {user_id: newSmartCard.executor_id, token : window.token});
      if (result.status == 'success' && result.data) {
        departmentList.length = 0;
        departmentList.push({
          value : result.data.department.value,
          label : result.data.department.label,
        })
        newSmartCard.department_id = result.data.department.value;
      }
    };

    function isValid(){
      let valid = true;
      if (!newSmartCard.kind)                                                {valid = false; errors.kind = 'Необходимо выбрать вид'};
      if (newSmartCard.kind === 'card' && !newSmartCard.typeId)              {valid = false; errors.typeId = 'Необходимо выбрать тип SMART-карты'};
      if (newSmartCard.period.type !== 'year' && !newSmartCard.period.value) {valid = false; errors.period = 'Необходимо выбрать период карты'};
      if (!newSmartCard.period.year)                                         {valid = false; errors.year = 'Необходимо установить год SMART-карты'};
      if (!newSmartCard.executor_id)                                         {valid = false; errors.executor_id = 'Необходимо выбрать исполнителя SMART-карты'};
      if (!newSmartCard.department_id)                                       {valid = false; errors.department_id = 'При загрузке формы не был получен департамент. Обратитесь в тех.поддержку'};
      return valid;
    };

    async function saveSmartCard(){
      if(!isValid()) return
      let smartCardToSend = {
        name          : `SMART-карта ${newSmartCard.period.type} ${newSmartCard.period.value} ${newSmartCard.period.year}`,
        kind          : newSmartCard.kind,
        type_id       : newSmartCard.typeId,
        executor_id   : newSmartCard.executor_id,
        department_id : newSmartCard.department_id,
        period_type   : newSmartCard.period.type,
        period_value  : newSmartCard.period.value,
        year          : newSmartCard.period.year,
        comment       : newSmartCard.comment,
        user_id       : userId.value, //для логов
      };
      loading.value = true;
      let result = await loadJson('/smart-card/add',  smartCardToSend);
      loading.value = false;
      if (result.status =='success') {
        smartCardId.value = result.id;
        router.push({name:'detail', params: { id: smartCardId.value, activeTab : 'tasks' }});
      }
      notify('Создание SMART-карты', result.message, result.status);
    };

    watch( [
          () => newSmartCard.kind,
          () => newSmartCard.period.type
      ], (values, oldValues) => {
        if(values[0] !== oldValues[0]){ newSmartCard.typeId = null;};
        if (values[1] !== oldValues[1]){
          periodParameterList.length = 0;
          newSmartCard.period.value = null;
          values[1] == 'month' ? monthList.forEach(el => periodParameterList.push(el)) : quarterList.forEach(el => periodParameterList.push(el));
        }
      }
    );

    watchEffect(() => {
      newSmartCard.kind          ? errors.kind          = null : '';
      newSmartCard.typeId        ? errors.typeId        = null : '';
      newSmartCard.period.value  ? errors.period        = null : '';
      newSmartCard.period.year   ? errors.year          = null : '';
      newSmartCard.executor_id   ? errors.executor_id   = null : '';
      newSmartCard.department_id ? errors.department_id = null : '';
    })

    return{
      newSmartCard, kindList, typeList, periodList, periodParameterList, periodYearList, usersList, errors, svg, loading, departmentList,
      saveSmartCard, searchUser, changeExecutor
    }
  },
}
</script>

<style scoped>

</style>