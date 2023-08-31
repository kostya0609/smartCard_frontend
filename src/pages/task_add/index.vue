<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="taskAdd-header">
      <h4>Подготовка задачи</h4>
      <returnButton/>
    </div>

    <el-row>
      <el-col :span="4">
        <label class="taskAdd-label">Тип задачи</label>
      </el-col>
      <el-col :span="8">
        <el-select
            :model-value="newTask.type"
            @update:modelValue="changeType"
            :class="['taskAdd-element', {'invalid' : errors.type}]"
            placeholder="Выберите тип"
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
        v-if="route.name === 'taskTemplatesAdd'"
      >
      </el-col>
      <el-col
        :span="5"
        v-if="route.name === 'taskTemplatesAdd'"
      >
        <el-checkbox
            v-model="newTask.fact_decrease"
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
            v-model="newTask.name"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.name}]"
            placeholder="Ввод текста"
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
            v-model="newTask.content"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.content}]"
            placeholder="Ввод текста"
        ></el-input>
        <small v-if="errors.content">{{errors.content}}</small>
      </el-col>
    </el-row>

    <el-row v-if="newTask.type==='quality'">
      <el-col :span="4">
        <label class="taskAdd-label">Критерии задачи</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="newTask.criterion"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.criterion}]"
            placeholder="Ввод текста"
        ></el-input>
        <small v-if="errors.criterion">{{errors.criterion}}</small>
      </el-col>
    </el-row>

    <el-row v-if="newTask.type!=='quality'">
      <el-col :span="4">
        <label class="taskAdd-label">Показатель</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="newTask.showing"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.showing}]"
            placeholder="Ввод текста"
        ></el-input>
        <small v-if="errors.showing">{{errors.showing}}</small>
      </el-col>
    </el-row>

    <el-row  v-if="newTask.type!=='quality'">
      <el-col :span="4">
        <label class="taskAdd-label">Вид задачи</label>
      </el-col>
      <el-col :span="8">
        <el-select
            v-model="newTask.threshold"
            :class="['taskAdd-element']"
            placeholder="Выберите вид"
        >
          <el-option
              v-for="item in thresholdList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-row v-if="newTask.type != 'quality' && newTask.threshold">
      <el-col :span="4">
        <label class="taskAdd-label">Минимальный порог, %</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="newTask.threshold_min"
            @input="changeThreshold"
            :class="['taskAdd-element', {'invalid' : errors.threshold_min}]"
            placeholder="Ввод числа"

       ></el-input>
        <small v-if="errors.threshold_min">{{errors.threshold_min}}</small>
      </el-col>
    </el-row>

    <el-row v-if="newTask.type != 'quality' && newTask.threshold">
      <el-col :span="4">
        <label class="taskAdd-label">Максимальный порог, %</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="newTask.threshold_max"
            @input="changeThreshold"
            :class="['taskAdd-element', {'invalid' : errors.threshold_max}]"
            placeholder="Ввод числа"
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
            v-model="newTask.plan"
            type="textarea"
            rows="3"
            :class="['taskAdd-element', {'invalid' : errors.plan}]"
            placeholder="Введите значение"
            :formatter=" newTask.type !== 'quality' ? (value) => value.replace(/[^\d.-]/ig, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
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
            v-model="newTask.weight"
            @change="newTask.weight = (parseFloat(newTask.weight)<=100 ? parseFloat(newTask.weight) : 100 )"
            class="taskAdd-element"
            placeholder="Ввод числа"
        ></el-input>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="4">
        <label class="taskAdd-label">Ссылка на задачу</label>
      </el-col>
      <el-col :span="8">
        <el-input
            v-model="newTask.link"
            class="taskAdd-element"
            placeholder="Введите значение"
        ></el-input>
      </el-col>
    </el-row>

    <el-row v-if="route.name==='taskAdd'">
      <el-col :span="4">
        <label class="taskAdd-label">Прикрепленные файлы</label>
      </el-col>
      <el-col :span="8">
        <el-upload
            v-model:file-list="newTask.files"
            drag
            ref="upload"
            action=""
            multiple
            :auto-upload="false"
            :on-remove="handleRemoveUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Перенесите файл в эту область или <em>нажмите на иконку загрузки</em>
          </div>
<!--          <template #tip>-->
<!--            <div class="el-upload__tip">-->
<!--              jpg/png files with a size less than 500kb-->
<!--            </div>-->
<!--          </template>-->
        </el-upload>
      </el-col>
    </el-row>

    <div class="taskAdd-footer">
      <el-button
          class="taskAdd-footer-button"
          @click="saveTask"
          :disabled="!errors.showSave"
      >
        Сохранить
      </el-button>
    </div>

  </div>
</template>

<script>

import {inject, reactive, watchEffect, watch, ref} from "vue";
import returnButton from "../../components/return_button";
import {useRoute, useRouter} from "vue-router/dist/vue-router";
import  {ElMessageBox }  from 'element-plus';

export default {
  name: "taskAddIndex",
  components: {returnButton},
  setup(){
    const route           = useRoute();
    const router          = useRouter();
    const loadJson        = inject('loadJson');
    const notify          = inject('notify');
    const userId          = inject('userId');
    const svg             = inject('svg');
    const smartCardId     = inject('smartCardId');
    smartCardId.value     = route.params.id

    const loading         = ref(false);

    const newTask         = reactive({
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
      showing       : '',
      files         : [],
      fact_decrease : false,
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
      threshold_max : null,
      plan          : null,
      showing       : null,
      showSave      : true,
    });

    function changeType(value){
      ElMessageBox.confirm(`Вы уверены, что хотите изменить тип задачи? При этом все заполненые ниже данные будут удалены!`)
        .then(() => {
          newTask.type = value;
          newTask.name = '';
          newTask.content = '';
          newTask.criterion = '';
          newTask.threshold = 0;
          newTask.threshold_min = '';
          newTask.threshold_max = '';
          newTask.plan = '';
          newTask.link = '';
          newTask.weight = '';
          newTask.showing = '';
        })
        .catch(() => {})
    };

    function changeThreshold(){
      newTask.threshold_min = (String(newTask.threshold_min).replace(/[^\d.]/ig, ''));
      newTask.threshold_max = (String(newTask.threshold_max).replace(/[^\d.]/ig, ''));

      if (+newTask.threshold_min > +newTask.threshold_max){
        errors.threshold_min = 'Минимальный порог не может быть больше максимального порога!';
        errors.threshold_max = 'Максимальный порог не может быть меньше минимального порога!'
        errors.showSave = false;
      } else {
        errors.threshold_min = null;
        errors.threshold_max = null;
      }

      if ( +newTask.threshold_min > 100){
        errors.threshold_min = 'Минимальный порог не может быть больше 100%';
        errors.showSave = false;
      }
      else errors.threshold_min = null;

      if(!errors.threshold_min && !errors.threshold_max) errors.showSave = true;
    };

    function isValid(){
      let valid = true;
      if (!newTask.name)                                    {valid = false; errors.name = 'Необходимо ввести наименование задачи'};
      if (!newTask.content)                                 {valid = false; errors.content = 'Необходимо ввести содержание задачи'};
      if (newTask.type === 'quality' && !newTask.criterion) {valid = false; errors.criterion = 'Необходимо ввести критерии задачи'};
      if (newTask.type !== 'quality' && !newTask.showing)   {valid = false; errors.showing = 'Необходимо ввести показатель задачи'};
      if (!newTask.type)                                    {valid = false; errors.type = 'Необходимо выбрать тип задачи'};
      if (newTask.threshold  && !newTask.threshold_min)     {valid = false; errors.threshold_min = 'Необходимо ввести минимальный порог задачи'};
      if (newTask.threshold  && !newTask.threshold_max)     {valid = false; errors.threshold_max = 'Необходимо ввести максимальный порог задачи'};
      if (!newTask.plan      && newTask.type !== 'quality') {valid = false; errors.plan = 'Необходимо ввести план задачи'};
      return valid;
    };

    function handleRemoveUpload(file, uploadFiles){
      newTask.files = uploadFiles
    };

    async function saveTask(){
      if(!isValid()) return;
      if(newTask.type !== 'quality') newTask.plan = String(newTask.plan).replace(/\s/g,"");

      let taskToSend = new FormData();
      for (let key in newTask){
        if (key !== 'files') {
          taskToSend.append(key, key !== 'fact_decrease' ? newTask[key] : (newTask[key] ? 1 : 0) );
        } else {
            for(let i = 0; i < newTask.files.length; i++){
              taskToSend.append('file['+i+']', newTask.files[i].raw);
            }
          }
      }
      taskToSend.append('user_id', userId.value);
      smartCardId.value ? taskToSend.append('smartcard_id', smartCardId.value) : '';

      let url =  route.name === 'taskAdd' ? '/smart-card/tasks/add' : '/smart-card/task-templates/add';
      loading.value = true;
      let result = await loadJson(url,  taskToSend, 'file');

      if (result.status === 'success'){
        if(route.name === 'taskAdd') router.push({name:'detail', params: { id: smartCardId.value, activeTab : 'tasks' }});
          else router.push({name:'taskTemplates'});
      }

      loading.value = false;
      notify('Добавление задачи', result.message, result.status);
    };

    watch( [
      () => newTask.threshold,
      () => newTask.weight,
    ], (newValues, oldValues) => {
      if (!newValues[0]) {
        newTask.threshold_min = '';
        newTask.threshold_max = '';
      };
      newTask.weight = (String(newValues[1]).replace(/[^.\d.]/ig, ''));
    });

    watchEffect(() => {
      newTask.name          ? errors.name = null : '';
      newTask.content       ? errors.content = null : '';
      newTask.criterion     ? errors.criterion = null : '';
      newTask.showing       ? errors.showing = null : '';
      newTask.type          ? errors.type = null : '';
      newTask.plan          ? errors.plan = null : '';
    })

    return{
      smartCardId, newTask, typeList, thresholdList, errors, loading,svg, route,
      saveTask, changeThreshold,changeType, handleRemoveUpload
    }
  },
}
</script>

<style scoped>

</style>