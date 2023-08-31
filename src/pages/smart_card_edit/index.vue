<template>
  <div>
    <div class="smartCardAdd-header">
      <h4>Редактирование SMART-карты</h4>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="4">
        <label class="smartCardAdd-label">Вид</label>
      </el-col>
      <el-col :span="4">
        <el-select
            v-model="editSmartCard.kind"
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
            v-model="editSmartCard.typeId"
            :class="['smartCardAdd-element', {'invalid' : errors.typeId}]"
            placeholder="Выберите тип"
            :disabled="editSmartCard.kind !== 'card'"
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
            v-model="editSmartCard.period.type"
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
            v-model="editSmartCard.period.value"
            :class="['smartCardAdd-element', {'invalid' : errors.period}]"
            placeholder="Параметр периода"
            :disabled="editSmartCard.period.type !== 'month' && editSmartCard.period.type !== 'quarter'"
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
            v-model="editSmartCard.period.year"
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
            v-model="editSmartCard.executor_id"
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
            v-model="editSmartCard.department_id"
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
            v-model="editSmartCard.comment"
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
import { useRouter, useRoute } from 'vue-router';

export default {
  name: "smartCardEditIndex",
  components: {returnButton},
  setup(){
    const router          = useRouter();
    const route           = useRoute();

    const loadJson        = inject('loadJson');
    const notify          = inject('notify');
    const userId          = inject('userId');
    const svg             = inject('svg');
    const smartCardId     = inject('smartCardId');
    !smartCardId.value ? smartCardId.value = route.params.id : '';

    const kindList        = inject('kindList');
    const typeList        = inject('typeList');
    const monthList       = inject('monthList');
    const quarterList     = inject('quarterList');
    const periodList      = inject('periodList');

    const loading             = ref(false);

    const editSmartCard       = reactive({
      kind          : 'card',
      typeId        : null,
      period        : {
        type  : null,
        value : null,
        year  : null,
      },
      executor_id   : null,
      department_id : null,
      comment       : null,
    });

    const periodParameterList = reactive([]);
    let currentYear           = new Date().getFullYear();
    const periodYearList      = reactive([
      {value : currentYear - 1, label : (currentYear - 1).toString()},
      {value : currentYear,     label : (currentYear).toString()},
      {value : currentYear + 1, label : (currentYear + 1).toString()},
    ]);

    const usersList           = reactive([]);
    const departmentList      = reactive([]);

    const errors              = reactive({
      kind          : null,
      typeId        : null,
      period        : null,
      year          : null,
      executor_id   : null,
      department_id : null,
    });

    function searchUser(query){
      let url = '/smart-card/search/user'; //
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
      let result = await loadJson('/smart-card/get-user', {user_id: editSmartCard.executor_id, token : window.token});
      if (result.status == 'success' && result.data) {
        departmentList.length = 0;
        departmentList.push({
          value : result.data.department.value,
          label : result.data.department.label,
        })
        editSmartCard.department_id = result.data.department.value;
      }
    };

    function isValid(){
      let valid = true;
      if (!editSmartCard.kind)                                                 {valid = false; errors.kind = 'Необходимо выбрать вид'};
      if (editSmartCard.kind === 'card' && !editSmartCard.typeId)              {valid = false; errors.typeId = 'Необходимо выбрать тип SMART-карты'};
      if (editSmartCard.period.type !== 'year' && !editSmartCard.period.value) {valid = false; errors.period = 'Необходимо выбрать период карты'};
      if (!editSmartCard.period.year)                                          {valid = false; errors.year = 'Необходимо установить год SMART-карты'};
      if (!editSmartCard.executor_id)                                          {valid = false; errors.executor_id = 'Необходимо выбрать исполнителя SMART-карты'};
      if (!editSmartCard.department_id)                                        {valid = false; errors.department_id = 'При загрузке формы не был получен департамент. Обратитесь в тех.поддержку'};
      return valid;
    };

    async function getData(){
      loading.value = true;
      //ниже получили основные данные по SMART-карте
      let result = await loadJson('/smart-card/get', {smartcard_id : smartCardId.value, user_id : userId.value});
      if(result.status === 'success'){
        editSmartCard.kind   = result.data.kind;
        editSmartCard.typeId = result.data.type_id;
        result.data.period_type == 'month' ? monthList.forEach(el => periodParameterList.push(el)) : quarterList.forEach(el => periodParameterList.push(el));
        editSmartCard.period.type = result.data.period_type;
        setTimeout(() => {editSmartCard.period.value = result.data.period_value},0);
        editSmartCard.period.year = result.data.year;
        editSmartCard.comment = result.data.comment;
        editSmartCard.executor_id = result.data.executor.value;
        usersList.push(result.data.executor);
        editSmartCard.department_id = result.data.department.value;
        departmentList.push(result.data.department);
      }
      loading.value = false;
    };
    getData();

    async function saveSmartCard(){
      if(!isValid()) return
      let smartCardToSend = {
        smartcard_id: smartCardId.value,
        name          : `SMART-карта ${editSmartCard.period.type} ${editSmartCard.period.value} ${editSmartCard.period.year}`,
        kind          : editSmartCard.kind,
        type_id       : editSmartCard.typeId,
        executor_id   : editSmartCard.executor_id,
        department_id : editSmartCard.department_id,
        period_type   : editSmartCard.period.type,
        period_value  : editSmartCard.period.value,
        year          : editSmartCard.period.year,
        comment       : editSmartCard.comment,
        user_id       : userId.value, //для логов
      };

      loading.value = true;
      let result = await loadJson('/smart-card/edit',  smartCardToSend);
      if (result.status =='success') {
        router.push({name:'detail', params: { id: smartCardId.value}});
      }
      loading.value = false;
      notify('Редактирование SMART-карты', result.message, result.status);
    };

    watch( [
          () => editSmartCard.kind,
          () => editSmartCard.period.type
        ], (values, oldValues) => {
          if(values[0] !== oldValues[0]){ editSmartCard.typeId = null;};
          if (values[1] !== oldValues[1]){
            periodParameterList.length = 0;
            editSmartCard.period.value = null;
            values[1] == 'month' ? monthList.forEach(el => periodParameterList.push(el)) : quarterList.forEach(el => periodParameterList.push(el));
          }
        }
    );

    watchEffect(() => {
      editSmartCard.kind          ? errors.kind          = null : '';
      editSmartCard.typeId        ? errors.typeId        = null : '';
      editSmartCard.period.value  ? errors.period        = null : '';
      editSmartCard.period.year   ? errors.year          = null : '';
      editSmartCard.executor_id   ? errors.executor_id   = null : '';
      editSmartCard.department_id ? errors.department_id = null : '';
    })

    return{
      editSmartCard, kindList, typeList, periodList, periodParameterList, periodYearList, usersList, errors, svg, loading, departmentList,
      saveSmartCard, searchUser, changeExecutor
    }
  },

}
</script>

<style scoped>

</style>