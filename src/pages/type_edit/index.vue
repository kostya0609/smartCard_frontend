<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="type-container"
  >
    <div class="typeAdd-header">
      <h3>Редактирование типа SMART-карты</h3>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="10">
        <el-row>
          <el-col :span="4" class="type-add-edit-col">
            <label class="typeAdd-label">Действующая</label>
          </el-col>
          <el-col :span="20" class="type-add-edit-col">
            <el-switch
                v-model="editType.active"
                active-text="Да"
                inactive-text="Нет"
            />
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4" class="type-add-edit-col">
            <label class="typeAdd-label">Название Eng</label>
          </el-col>
          <el-col :span="20" class="type-add-edit-col">
            <el-input
                v-model="editType.name"
                :class="['typeAdd-element', {'invalid' : errors.typeName}]"
                placeholder="Ввод текста"
            ></el-input>
            <small v-if="errors.typeName">{{errors.typeName}}</small>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4" class="type-add-edit-col">
            <label class="typeAdd-label">Название Rus</label>
          </el-col>
          <el-col :span="20" class="type-add-edit-col">
            <el-input
                v-model="editType.translateName"
                :class="['typeAdd-element', {'invalid' : errors.translateName}]"
                placeholder="Ввод текста"
            ></el-input>
            <small v-if="errors.translateName">{{errors.translateName}}</small>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4" class="type-add-edit-col">
            <label class="typeAdd-label">Индикаторы</label>
          </el-col>
          <el-col :span="18" class="type-add-edit-col">
            <el-table
                :data="editType.indicators"
                border
            >
              <el-table-column prop="id" label="ID" width="60"/>
              <el-table-column prop="name" label="Название"/>
              <el-table-column  label="Действие" width="110">
                <template #default="scope" >
                  <div v-if="scope.row.action !=='delete'">
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
                        @click="indicatorDelete(scope.$index, scope.row)"
                    >
                      <el-icon><CloseBold /></el-icon>
                    </el-button>
                  </div>
                  <span v-else>Удалена.</span>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="2" align="right">
            <el-button
                class="menu-right-element-button"
                @click="indicator.showModal=true; indicator.add=true;"
            >
              <el-icon><Plus/></el-icon>
            </el-button>
          </el-col>
        </el-row>
      </el-col>

      <el-col :span="1"/>

      <el-col :span="13">
        <div class="taskTemplates">
          <h3>Шаблоны задач</h3>
          <el-row>
            <el-table
                :data="editType.taskTemplates"
                border
            >
              <el-table-column  prop="id" label="ID" width="60px"/>
              <el-table-column  prop="type" label="Тип"/>
              <el-table-column  prop="name" label="Название"/>
              <el-table-column  prop="content" label="Содержание"/>
              <el-table-column  prop="criterion" label="Критерии"/>
              <el-table-column  prop="fact_decrease" label="Понижение факта">
                <template #default="scope" >
                  {{scope.row.fact_decrease ? 'Да' : 'Нет'}}
                </template>
              </el-table-column>
              <el-table-column   align="center" width="65">
                <template #default="scope" >
                  <el-button
                      size="small"
                      type="danger"
                      @click="deleteTaskTemplate(scope.$index, scope.row)"
                  >
                    <el-icon><CloseBold /></el-icon>
                  </el-button>


                </template>
              </el-table-column>
            </el-table>
          </el-row>
          <div class="taskTemplateAdd-footer">
            <el-button
                class="taskAdd-footer-button"
                @click="addTaskTemplates"
            >
              Добавить задачу
            </el-button>
          </div>
        </div>
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
        @close="indicator.showModal=false; indicator.name=null; indicator.add=false; indicator.idx=null"
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
        <el-button @click="indicator.showModal=false; indicator.name=null; indicator.add=false; indicator.idx=null" >Отменить</el-button>
        <el-button type="primary" @click="saveIndicator">
          Сохранить
        </el-button>
      </span>
      </template>
    </el-dialog>

    <el-dialog
        v-model="taskTemplates.showModal"
        title="Добавление задачи из шаблонов"
        width="90%"
        top="0"
        align-center
        :show-close="false"
        @close="taskTemplates.showModal=false"
    >
        <el-scrollbar height="500px">
            <task-templates
              style="padding-right: 10px; overflow: hidden"
              v-if="taskTemplates.showModal"
            />
        </el-scrollbar>
      <br/>
      <label>
        Выбраны следующие задачи с ID : <span v-for="item in newTaskTemplates" >{{item}},&nbsp</span>
      </label>

      <template #footer>
        <span class="dialog-footer">
        <el-button @click="newTaskTemplates.length=0; taskTemplates.showModal=false" >Отменить</el-button>
        <el-button type="primary" @click="saveTaskTemplates">
          Сохранить
        </el-button>
      </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import returnButton from "../../components/return_button";
import taskTemplates from "../task_templates";
import { useRouter, useRoute } from 'vue-router';
import {inject, reactive, ref, watchEffect} from "vue";
import {ElMessageBox} from "element-plus";

export default {
  name: "type_edit",
  components: {returnButton, taskTemplates},
  setup(){
    const loadJson           = inject('loadJson');
    const svg                = inject('svg');
    const notify             = inject('notify');
    const userId             = inject('userId');
    const newTaskTemplates   = inject('newTaskTemplates');
    newTaskTemplates.length  = 0;

    const router             = useRouter();
    const route              = useRoute();
    let loading              = ref(false);
    let typeId               = route.params.id;
    let editType             = reactive({
      name            : null,
      translateName   : null,
      indicators      : [],
      active          : null,
      taskTemplates   : [],
    });
    let indicator            = reactive({
      showModal : false,
      name      : null,
      add       : false,
      idx       : false,
      id        : null,
    });
    let taskTemplates        = reactive({
      showModal : false,
    });
    const errors             = reactive({
      indicatorName  : null,
      typeName       : null,
      translateName  : null,
    });

    async function getData(){
      loading.value = true;
      let result = await loadJson('/smart-card/type/list',  {
        type_id        : typeId,
        user_id        : userId.value
      });
      if (result.status =='success' && result.data) {
        editType.name = result.data.name;
        editType.translateName = result.data.translate_name;
        editType.taskTemplates = result.data.task_templates;
        result.data.indicators.forEach(el => {el.action = 'none'; editType.indicators.push(el)});
        editType.active = result.data.active == 1 ? true : false;
      };
      loading.value = false;
    };
    getData();

    function indicatorEdit(index, row){
      indicator.showModal = true;
      indicator.add = false;
      indicator.name = row.name;
      indicator.idx = index;
      indicator.id = row.id;
    };

    function indicatorDelete(index, row){
      if (editType.indicators[index].id ) editType.indicators[index].action = 'delete';
        else editType.indicators.splice(index, 1)
    }

    function addTaskTemplates(){
      taskTemplates.showModal = true;
      newTaskTemplates.length = 0;
      editType.taskTemplates.forEach(el => newTaskTemplates.push(el.id))
    };

    function deleteTaskTemplate(index, row){
      ElMessageBox.confirm(`Вы уверены, что хотите удалить шаблоную задачу с ID - ${row.id}?`)
          .then(async () => {
            editType.taskTemplates.splice(index, 1)
            let templates = [];
            editType.taskTemplates.forEach(el => templates.push(el.id)),
                loading.value = true;
            let result = await loadJson('/smart-card/type/templates',  {
              type_id        : typeId,
              user_id        : userId.value,
              templates
            });
            loading.value = false;
            if(result.status !== 'success') await getData();
            notify(`Удаление шаблонной задачи`, result.message, result.status);
          })
          .catch(() => {})
    };

    function saveIndicator(){
      if (!indicator.name){errors.indicatorName = 'Необходимо указать название индикатора'; return}
      //ниже проверка что такой показатель уже существует
      if (editType.indicators.find(el => {
        return el.name === indicator.name.trim()
      })) {notify('Добавление показателя', 'Показатель с таким названием был добавлен ранее.','error');  return;}

      if (indicator.add ) editType.indicators.push({name : indicator.name, action : 'add'}); else {
        editType.indicators[indicator.idx].name = indicator.name;
        editType.indicators[indicator.idx].id ? editType.indicators[indicator.idx].action = 'edit' : '';
      }

      indicator.showModal = false;
      indicator.name = null;
      indicator.add = false;
      indicator.idx = null;
      indicator.id = null;
    };

    async function saveTaskTemplates(){
      taskTemplates.showModal = false;
      loading.value = true;
      let result = await loadJson('/smart-card/type/templates',  {
        type_id        : typeId,
        user_id        : userId.value,
        templates      : newTaskTemplates,
      });
      loading.value = false;

      if (result.status =='success') {
        newTaskTemplates.length = 0;
        await getData();
      }
      notify(`Добавление шаблонных задач`, result.message, result.status);
    };

    async function saveType(){
      if (!editType.name)          {errors.typeName      = 'Необходимо ввести название типа на английском'; return};
      if (!editType.translateName) {errors.translateName = 'Необходимо ввести название типа на русском'; return};

      loading.value = true;
      let result = await loadJson('/smart-card/type/edit',  {
        type_id        : typeId,
        name           : editType.name,
        translate_name : editType.translateName,
        indicators     : editType.indicators,
        user_id        : userId.value,
        active         : editType.active ? 1 : 0,
      });
      if (result.status =='success')  router.push({name:'types'});
      loading.value = false;
      notify(`Редактирование типа`, result.message, result.status);
    };

    watchEffect(() => {
      indicator.name           ? errors.indicatorName = null : '';
      editType.name            ? errors.typeName = null : '';
      editType.translateName   ? errors.translateName = null : '';
    });

    return{
      loading, svg, indicator, errors, editType, taskTemplates, newTaskTemplates,
      indicatorEdit, indicatorDelete, saveIndicator, saveType, saveTaskTemplates, addTaskTemplates, deleteTaskTemplate
    }
  },
}
</script>

<style scoped>
.type-container >>> .el-dialog__body {
  padding: 5px 15px;
}

</style>