<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="taskAdd-header">
      <h4>{{showHeader}}{{editTask.fact_decrease ? '(задача на понижение факта)' : ''}}</h4>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="4">
        <label class="taskAdd-label">Тип задачи</label>
      </el-col>
      <el-col :span="8">
        <el-select
            :model-value="editTask.type"
            @update:modelValue="changeType"
            :class="['taskAdd-element', {'invalid' : errors.type}]"
            placeholder="Выберите тип"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access || editTask.fact_decrease)"
        >
          <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.type">{{errors.type}}</small>
      </el-col>
      <el-col
          :span="2"
          v-if="route.name === 'taskTemplatesEdit' || editingAnyStatus"
      >
      </el-col>
      <el-col
          :span="5"
          v-if="route.name === 'taskTemplatesEdit' || editingAnyStatus"
      >
        <el-checkbox
            v-model="editTask.fact_decrease"
            label="Задача на понижение факта"
            border
        />
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="taskAdd-label">Наименование</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.name"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.name}]"
            placeholder="Ввод текста"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access || editTask.fact_decrease)"
        ></el-input>
        <small v-if="errors.name">{{errors.name}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="taskAdd-label">Содержание задачи</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.content"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.content}]"
            placeholder="Ввод текста"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
        ></el-input>
        <small v-if="errors.content">{{errors.content}}</small>
      </el-col>
    </el-row>

    <el-row v-if="editTask.type==='quality'">
      <el-col :span="4">
        <label class="taskAdd-label">Критерии задачи</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.criterion"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.criterion}]"
            placeholder="Ввод текста"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
        ></el-input>
        <small v-if="errors.criterion">{{errors.criterion}}</small>
      </el-col>
    </el-row>

    <el-row v-if="editTask.type!=='quality'">
      <el-col :span="4">
        <label class="taskAdd-label">Показатель</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.showing"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.showing}]"
            placeholder="Ввод текста"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
        ></el-input>
        <small v-if="errors.showing">{{errors.showing}}</small>
      </el-col>
    </el-row>

    <el-row  v-if="editTask.type!=='quality'">
      <el-col :span="4">
        <label class="taskAdd-label">Вид задачи</label>
      </el-col>
      <el-col :span="8">
        <el-select
            v-model="editTask.threshold"
            :class="['taskAdd-element', {'invalid' : errors.threshold}]"
            placeholder="Выберите вид"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
        >
          <el-option
              v-for="item in thresholdList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.threshold">{{errors.threshold}}</small>
      </el-col>
    </el-row>

    <el-row v-if="editTask.type != 'quality' && editTask.threshold">
      <el-col :span="4">
        <label class="taskAdd-label">Минимальный порог, %</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.threshold_min"
            @input="changeThreshold"
            :class="['taskAdd-element', {'invalid' : errors.threshold_min}]"
            placeholder="Ввод числа"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
        ></el-input>
        <small v-if="errors.threshold_min">{{errors.threshold_min}}</small>
      </el-col>
    </el-row>

    <el-row v-if="editTask.type != 'quality' && editTask.threshold">
      <el-col :span="4">
        <label class="taskAdd-label">Максимальный порог, %</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.threshold_max"
            @input="changeThreshold"
            :class="['taskAdd-element', {'invalid' : errors.threshold_max}]"
            placeholder="Ввод числа"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
        ></el-input>
        <small v-if="errors.threshold_max">{{errors.threshold_max}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="taskAdd-label">План</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.plan"
            type="textarea"
            rows="3"
            :class="['smartCardAdd-element', {'invalid' : errors.plan}]"
            placeholder="Введите значение"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
            :formatter=" editTask.type !== 'quality' ? (value) => value.replace(/[^\d.-]/ig, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
        ></el-input>
        <small v-if="errors.plan">{{errors.plan}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="taskAdd-label">Вес задачи, %</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.weight"
            @change="editTask.weight = (parseFloat(editTask.weight)<=100 ? parseFloat(editTask.weight) : 100 )"
            class="taskAdd-element"
            placeholder="Ввод числа"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
        ></el-input>
      </el-col>
    </el-row>

    <el-row v-if="route.name==='taskEdit'">
      <el-col :span="4">
        <label class="taskAdd-label">Факт</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.fact"
            @change="editTask.type !== 'quality' ? editTask.fact = parseFloat(editTask.fact) : ''"
            type="textarea"
            rows="2"
            :class="['taskAdd-element', {'invalid' : errors.fact}]"
            placeholder="Ввод числа"
            :disabled="!editingAnyStatus && (smartCardStatus !=='report_prepare' || !full_access)"
        ></el-input>
        <small v-if="errors.fact">{{errors.fact}}</small>
      </el-col>
    </el-row>

    <el-row v-if="route.name==='taskEdit' && editTask.type =='quality'">
      <el-col :span="4">
        <label class="taskAdd-label">Факт %</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.fact_percent"
            :class="['taskAdd-element', {'invalid' : errors.fact_percent}]"
            @change="editTask.fact_percent = parseFloat(editTask.fact_percent)"
            type="textarea"
            rows="3"
            class="taskAdd-element"
            placeholder="Ввод числа"
            :disabled="!editingAnyStatus && (smartCardStatus !=='report_prepare' || !full_access)"
        ></el-input>
        <small v-if="errors.fact_percent">{{errors.fact_percent}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="taskAdd-label">Ссылка на задачу</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="editTask.link"
            class="taskAdd-element"
            placeholder="Введите значение"
            :disabled="!editingAnyStatus && (smartCardStatus !=='created' || !full_access)"
        ></el-input>
      </el-col>
    </el-row>

    <el-row v-if="route.name==='taskEdit'">
      <el-col :span="4">
        <label class="taskAdd-label">Прикрепленные файлы</label>
      </el-col>
      <el-col :span="8">
        <el-upload
            v-model:file-list="editTask.file_exists"
            drag
            ref="upload"
            action=""
            multiple
            :auto-upload="false"
            :on-change="fileChange"
            :on-remove="fileRemove"
            :on-preview = 'downLoadFile'
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Перенесите файл в эту область или <em>нажмите на иконку загрузки</em>
          </div>
        </el-upload>
      </el-col>
    </el-row>

    <div class="taskEdit-footer">
      <el-button
          v-if="editingAnyStatus || ((smartCardStatus ==='created' || smartCardStatus ==='report_prepare') && full_access)"
          class="taskAdd-footer-button"
          @click="saveTask"
          :disabled="!errors.showSave"
      >
        Сохранить
      </el-button>

      <el-button
          v-if="editingAnyStatus || ((smartCardStatus ==='created' || smartCardStatus ==='report_prepare') && full_access && route.name === 'taskEdit' && route.params.type_id != 11 )"
          class="taskAdd-footer-button"
          @click="saveClone"
          :disabled="!errors.showSave"
      >
        Клонировать
      </el-button>
<!--route.params.type_id != 11 это для базовой смарткарты, у нее нельзя разрешать клонировать задачи -->
    </div>
  </div>
</template>

<script>

import {inject, reactive, watch, watchEffect, computed, ref} from "vue";
import returnButton from "../../components/return_button";
import {useRouter, useRoute} from "vue-router/dist/vue-router";
import {ElMessageBox} from "element-plus";


export default {
  name: "taskEditIndex",
  components: {returnButton},
  setup(){
    const router          = useRouter();
    const route           = useRoute();
    const loadJson        = inject('loadJson');
    const notify          = inject('notify');
    const userId          = inject('userId');
    const full_access     = inject('full_access');
    const svg             = inject('svg');

    const smartCardId     = inject('smartCardId');
    !smartCardId.value ? smartCardId.value = route.params.smartCardId : '';

    const smartCardStatus = inject('smartCardStatus');
    !smartCardStatus.value ? smartCardStatus.value = route.params.smartCardStatus : '';

    route.name === 'taskTemplatesEdit' ? full_access.value = true : '';

    const loading         = ref(false);

    const editingAnyStatus= inject('editingAnyStatus');

    const editTask        = reactive({
      task_id       : route.params.id,
      name          : '',
      content       : '',
      criterion     : '',
      type          : 'quality',
      threshold     : 0,
      threshold_min : '',
      threshold_max : '',
      plan          : '',
      link          : '',
      weight        : '',
      fact          : '',
      fact_percent  : '',
      showing       : '',
      fact_decrease : false,
      template_id   : null,
      file          : [],
      file_save     : [],
      file_exists   : [],
    });
    const typeList        = reactive([
      {value : 'quality',   label : 'Качественный'},
      {value : 'financial', label : 'Финансовый'},
      {value : 'amount' ,   label : 'Количественный'},
    ]);
    const thresholdList   = reactive([
      {value : 0,  label : 'Без порога отсечения'},
      {value : 1,  label : 'С порогом отсечения'}
    ]);
    const errors          = reactive({
      name          : null,
      content       : null,
      criterion     : null,
      type          : null,
      threshold     : null,
      threshold_min : null,
      plan          : null,
      showing       : null,
      fact          : null,
      fact_percent  : null,
      showSave      : true,
    });

    let showHeader        = computed(() => {
      let showValue = 'Просмотр / редактирование задачи';
      if (smartCardStatus.value !== 'created' || !full_access.value) showValue = 'Просмотр задачи';
      if (smartCardStatus.value === 'report_prepare' && full_access.value) showValue = 'Просмотр задачи с возможностью редактирования полей ФАКТ';
      if(editingAnyStatus.value) showValue = 'Просмотр задачи с возможностью редактирования полей задачи из любого статуса смарт карты';
      return showValue
    });

    function changeType(value){
      ElMessageBox.confirm(`Вы уверены, что хотите изменить тип задачи? При этом все заполненые ниже данные будут удалены!`)
          .then(() => {
            editTask.type           = value;
            editTask.name           = '';
            editTask.content        = '';
            editTask.criterion      = '';
            editTask.threshold      = 0;
            editTask.threshold_min  = '';
            editTask.threshold_max  = '';
            editTask.plan           = '';
            editTask.link           = '';
            editTask.weight         = '';
            editTask.fact           = '';
            editTask.fact_percent   = '';
            editTask.showing        = '';
          })
          .catch(() => {})
    };

    function changeThreshold(){
      editTask.threshold_min = (String(editTask.threshold_min).replace(/[^\d.]/ig, ''));
      editTask.threshold_max = (String(editTask.threshold_max).replace(/[^\d.]/ig, ''));
      if (+editTask.threshold_min > +editTask.threshold_max){
        errors.threshold_min = 'Минимальный порог не может быть больше максимального порога!';
        errors.threshold_max = 'Максимальный порог не может быть меньше минимального порога!'
        errors.showSave = false;
      } else {
        errors.threshold_min = null;
        errors.threshold_max = null;
      }

      if ( +editTask.threshold_min > 100){
        errors.threshold_min = 'Минимальный порог не может быть больше 100%';
        errors.showSave = false;
      }
      else  errors.threshold_min = null;

      if(!errors.threshold_min && !errors.threshold_max) errors.showSave = true;
    };

    async function getData(){
      loading.value = true;
      //ниже получили основные данные по задаче

      let url = route.name == 'taskEdit' ? '/smart-card/tasks/get' : '/smart-card/task-templates/get';

      let result = await loadJson(url, {
            smartcard_id : smartCardId.value,
            [route.name == 'taskEdit' ? 'task_id' : 'template_id'] : route.params.id,
            user_id      : userId.value
      });

      if(result.status === 'success'){
        full_access.value      = result.data.full_access;
        editTask.name          = result.data.name;
        editTask.type          = result.data.type;
        editTask.content       = result.data.content;
        editTask.showing       = result.data.showing;
        editTask.criterion     = result.data.criterion;
        editTask.threshold     = result.data.threshold;
        editTask.threshold_min = result.data.threshold_min;
        editTask.threshold_max = result.data.threshold_max;

        if (result.data.plan && result.data.type !=='quality') editTask.plan = result.data.plan.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
          else editTask.plan = result.data.plan;

        editTask.link          = result.data.link;
        editTask.weight        = result.data.weight;
        editTask.fact          = result.data.fact;
        editTask.fact_percent  = result.data.fact_percent;
        editTask.fact_decrease = result.data.fact_decrease ? true : false;
        editTask.template_id   = result.data.template_id ?? null;
        editTask.file_save     = result.data.files;
        editTask.file_exists   = result.data.files;
      }
      loading.value = false;
    };
    getData();

    function isValid(){
      let valid = true;
      if (!editTask.name)                                               {valid = false; errors.name = 'Необходимо ввести наименование задачи'};
      if (!editTask.content)                                            {valid = false; errors.content = 'Необходимо ввести содержание задачи'};
      if (editTask.type === 'quality' && !editTask.criterion)           {valid = false; errors.criterion = 'Необходимо ввести критерии задачи'};

      if (smartCardStatus.value === 'report_prepare' && !editTask.fact) {valid = false; errors.fact = 'Необходимо ввести факт'}
          // (!editTask.fact || editTask.fact < 0))              {valid = false; errors.fact = 'Необходимо ввести факт'}

      if (editTask.type === 'quality' &&
          editTask.fact_percent != 0  &&
          editTask.fact_percent != 100)                                 {valid = false; errors.fact_percent = 'Для качественной задачи факт в % может быть равен 0% или 100%'};

      if (editTask.type !== 'quality' && !editTask.showing)             {valid = false; errors.showing = 'Необходимо ввести показатель задачи'};
      if (!editTask.type)                                               {valid = false; errors.type = 'Необходимо выбрать тип задачи'};
      if (editTask.threshold  && !editTask.threshold_min)               {valid = false; errors.threshold_min = 'Необходимо ввести минимальный порого задачи'};
      if (editTask.threshold  && !editTask.threshold_max)               {valid = false; errors.threshold_max = 'Необходимо ввести максимальный порого задачи'};
      if (!editTask.plan      && editTask.type !== 'quality')           {valid = false; errors.plan = 'Необходимо ввести план задачи'};
      return valid;
    };

    function fileChange(file){
      let newFilName = file.name;

      let err_there_is_file      = !!editTask.file.find(item =>
          newFilName === item.name
      );

      let err_there_is_file_save = !!editTask.file_save.find(item =>
          newFilName === `${item.name}.${item.type}`
      );

      if (!err_there_is_file && !err_there_is_file_save ){
        editTask.file.push(file.raw);
      } else {
        notify('Ошибка добавления дополнительного файла', 'Файл с таким именем уже существует.', 'error');
        setTimeout(() => {editTask.file_exists.splice(editTask.file_exists.length - 1 , 1)}, 0);
      };

    };

    function fileRemove(file){
      editTask.file_save = editTask.file_save.filter(el => el.uid !== file.uid);
      editTask.file      = editTask.file.filter(el => el.uid !== file.uid);
    };

    const downLoadFile = async(file) =>{
      if(file.id) {
        try {
          let result = await loadJson('/smart-card/load-file', {file_id : file.id}, '', true); //параметры - url, объкт с данными(id файла), type (если указать 'file' то это для отправки файла и отсылаемые данные уйдут не json-ом а как форма), downLoadRequest - если true то результат не будет преобразован через json )
          let blob      = await result.blob();
          let url       = URL.createObjectURL(blob);
          let link      = document.createElement('a');
          link.href     = url;
          //link.download = file.name;
          link.download = `${file.name}.${file.type}`;

          link.click();
          URL.revokeObjectURL(link.href);
        }catch(e){
          notify('Ошибка загрузки файла', e.message, 'error')
        }
      } else {
        notify('Ошибка загрузки файла', 'Этот файл недоступен для скачивания. Так как был только что добавлен.', 'error')
      }
    };

    async function saveTask(){

      if(!isValid()) return;
      if(editTask.type !== 'quality') editTask.plan = String(editTask.plan).replace(/\s/g,"");

      let url = route.name === 'taskEdit' ? '/smart-card/tasks/edit' : '/smart-card/task-templates/edit';

      loading.value = true;
      let result = null;

      if(route.name === 'taskEdit'){

        let taskToSend = new FormData;

        for (let key in editTask){
          if (key !== 'file' && key !== 'file_save' && key !== 'file_exists')
            taskToSend.append(
                'data[0]['+key+']',
                editTask[key] !== null ? ( key !== 'fact_decrease' ?  editTask[key] : (editTask[key] ? 1 : 0) )  : ''
            );
        }

        for(let i = 0; i < editTask.file.length; i++) {
          taskToSend.append('data[0][file][' + i + ']', editTask.file[i]);
        }

        for(let i = 0; i < editTask.file_save.length; i++){
          taskToSend.append('data[0][file_save]['+i+']', editTask.file_save[i].id);
         }

        taskToSend.append('user_id', userId.value);
        taskToSend.append('smartcard_id', smartCardId.value);

        result = await loadJson(url, taskToSend, 'file');

      } else {
          result = await loadJson(url, {
            user_id       : userId.value,
            data          : {
              ...editTask,
              fact_decrease : editTask.fact_decrease ? 1 : 0,
            },
            template_id   : route.params.id,
          });
        }

      if (result.status === 'success') {
        if (route.name === 'taskEdit') router.push({name:'detail', params: { id: smartCardId.value, activeTab : 'tasks' }});
            else router.push({name:'taskTemplates'});
      }
      loading.value = false;
      notify('Редактирование задачи', result.message, result.status);
    };

    function saveClone(){
      ElMessageBox.confirm(`Вы уверены, что хотите клонировтаь задачу ?`)
        .then(async() => {
          loading.value = true;
          let result = await loadJson('/smart-card/tasks/clone', {
            smartcard_id : smartCardId.value,
            template_id  : editTask.template_id,
            user_id      : userId.value,
          });

          if (result.status === 'success') {
            router.push({name:'detail', params: { id: smartCardId.value, activeTab : 'tasks' }});

          }
          loading.value = false;
          notify('Клонирование задачи', result.message, result.status);

        })
        .catch(() => {})
    };

    watch( [
      () => editTask.threshold,
      () => editTask.weight,
      () => editTask.fact,
      () => editTask.fact_percent,
    ], (values) => {
      if (!values[0]) {
        editTask.threshold_min = '';
        editTask.threshold_max = '';
      };
      editTask.weight = (String(values[1]).replace(/[^.\d.]/ig, ''));
      if(editTask.type !== 'quality') editTask.fact = (String(values[2]).replace(/[^\d.-]/ig, ''));
      editTask.fact_percent = (String(values[3]).replace(/[^\d.]/ig, ''));
    });

    watchEffect(() => {
      editTask.name          ? errors.name = null : '';
      editTask.content       ? errors.content = null : '';
      editTask.criterion     ? errors.criterion = null : '';
      editTask.showing       ? errors.showing = null : '';
      editTask.type          ? errors.type = null : '';
      editTask.plan          ? errors.plan = null : '';
      editTask.fact_percent  ? errors.fact_percent = null : '';
      editTask.fact          ? errors.fact = null : '';
    })

    return{
      editingAnyStatus,
      smartCardId, editTask, typeList, thresholdList, errors, loading,svg, smartCardStatus, showHeader, full_access, route,
      saveTask,changeThreshold,changeType, fileChange, fileRemove, downLoadFile, saveClone
    }
  },
}
</script>

<style scoped>

</style>