<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="type-container"
  >
    <div class="typeAdd-header">
      <h3>Добавление типа SMART-карты</h3>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="2" class="type-add-edit-col">
        <label class="typeAdd-label">Название Eng</label>
      </el-col>
      <el-col :span="8" class="type-add-edit-col">
        <el-input
            v-model="newType.name"
            :class="['typeAdd-element', {'invalid' : errors.typeName}]"
            placeholder="Ввод текста"
        ></el-input>
        <small v-if="errors.typeName">{{errors.typeName}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="2" class="type-add-edit-col">
        <label class="typeAdd-label">Название Rus</label>
      </el-col>
      <el-col :span="8" class="type-add-edit-col">
        <el-input
            v-model="newType.translateName"
            :class="['typeAdd-element', {'invalid' : errors.translateName}]"
            placeholder="Ввод текста"
        ></el-input>
        <small v-if="errors.translateName">{{errors.translateName}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="2" class="type-add-edit-col">
        <label class="typeAdd-label">Индикаторы</label>
      </el-col>
      <el-col :span="7">
        <el-table
            :data="newType.indicators"
            border
        >
          <el-table-column prop="name" label="Название">
          </el-table-column>
          <el-table-column  label="Действие" width="110">
            <template #default="scope">
              <el-button
                  size="small"
                  type="info"
                  @click="indicatorEdit(scope.$index, scope.row)"
              >
                <el-icon><Tools /></el-icon>
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  @click="newType.indicators.splice(scope.$index,1);"
              >
                <el-icon><CloseBold /></el-icon>
              </el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="1" align="right">
        <el-button
            class="menu-right-element-button"
            @click="indicator.showModal=true; indicator.add=true;"
        >
          <el-icon><Plus/></el-icon>
        </el-button>
      </el-col>
    </el-row>

    <div class="taskAdd-footer">
      <el-button
          class="taskAdd-footer-button"
          @click="saveType"
      >
        Сохранить
      </el-button>
    </div>

    <el-dialog
        v-model="indicator.showModal"
        :title="indicator.add ? 'Добавление индикатора':'Редактирование индикатора'"
        width="30%"
        align-center
        :show-close="false"
    >
      <el-input
          v-model="indicator.name"
          :class="['typeAdd-element', {'invalid' : errors.indicatorName}]"
          placeholder="Введите название индикатора"
          @keyup.enter="saveIndicator"
      >
      </el-input>
      <small v-if="errors.indicatorName">{{errors.indicatorName}}</small>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="indicator.showModal=false; indicator.name=null; indicator.add=false, indicator.idx=null" >Отменить</el-button>
        <el-button type="primary" @click="saveIndicator">
          Сохранить
        </el-button>
      </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import returnButton from "../../components/return_button";
import { useRouter, useRoute } from 'vue-router';
import {inject, reactive, ref, watchEffect} from "vue";

export default {
  name: "type_add",
  components: {returnButton},
  setup(){
    const loadJson           = inject('loadJson');
    const svg                = inject('svg');
    const notify             = inject('notify');
    const userId             = inject('userId');

    const router             = useRouter();
    let loading              = ref(false);

    let newType              = reactive({
      name            : null,
      translateName   : null,
      indicators      : [],
    });

    let indicator            = reactive({
      showModal : false,
      name      : null,
      add       : false,
      idx       : false,
    });

    const errors             = reactive({
      indicatorName  : null,
      typeName       : null,
      translateName  : null,
    });

    function indicatorEdit(index, row){
        indicator.showModal = true;
        indicator.add = false;
        indicator.name = row.name;
        indicator.idx = index;
    };

    function saveIndicator(){
      if (!indicator.name){errors.indicatorName = 'Необходимо указать название индикатора'; return}
      //ниже проверка что такой показатель уже существует
      if (newType.indicators.find(el => {
        return el.name === indicator.name.trim()
      })) {notify('Добавление показателя', 'Показатель с таким названием был добавлен ранее.','error');  return;}

      indicator.add ? newType.indicators.push({name : indicator.name}) : newType.indicators[indicator.idx].name = indicator.name;

      indicator.showModal = false;
      indicator.name = null;
      indicator.add = false;
      indicator.idx = null;
    };

    async function saveType(){
      if (!newType.name)          {errors.typeName      = 'Необходимо ввести название типа на ангийском'; return};
      if (!newType.translateName) {errors.translateName = 'Необходимо ввести название типа на русском'; return};

      loading.value = true;
      let result = await loadJson('/smart-card/type/create',  {
          name           : newType.name,
          translate_name : newType.translateName,
          indicators     : newType.indicators,
          user_id        : userId.value,
          active         : 1,
      });
      if (result.status =='success') router.push({name:'types'});
      loading.value = false;
      notify(`Создание типа`, result.message, result.status);
    };

    watchEffect(() => {
      indicator.name          ? errors.indicatorName = null : '';
      newType.name            ? errors.typeName = null : '';
      newType.translateName   ? errors.translateName = null : '';
    });

    return{
      loading, svg, indicator, errors, newType,
      indicatorEdit, saveIndicator, saveType
    }
  },
}
</script>

<style scoped>

</style>