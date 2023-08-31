<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <Grid
        :name="name"
        @gridReady="getData"
    />

<!--            <el-button @click="sendDefaultFilterData">-->
<!--              Загрузить дефолтовый фильтр-->
<!--            </el-button>-->

  </div>
</template>

<script>

import { useRouter, useRoute } from 'vue-router';
import {ref, reactive, provide, inject, computed} from "vue";

import initGrid from '../../vdg3/use/initGrid';
import Grid from '../../vdg3/components/grid.n.vue';
import  {ElMessageBox }  from 'element-plus';


export default {
  name: "default_tasks",
  components: {Grid},
  setup(){
    const userId          = inject('userId');
    const domain          = inject('domain');
    const loadJson        = inject('loadJson');
    const notify          = inject('notify');
    const svg             = inject('svg');
    const newTaskTemplates= inject('newTaskTemplates');

    let paginationData    = inject('paginationDataTaskTemplates');
    let sortData          = inject('sortDataTaskTemplates');
    let filterData        = inject('filterDataTaskTemplates');
    let showValueFilter   = inject('showValueTaskTemplatesFilter');
    let activeProfile     = inject('activeProfileTaskTemplates');

    const router          = useRouter();
    const route           = useRoute();
    const loading         = computed(() => { return dataGrid.loading });
    const name            = ref('smartCardTaskTemplates');

    const gridElements    = reactive([]);
    const content         = reactive({
      setting         : true,
      header          : {
        id                  : {
          name: 'Номер',
          width: 100,
          show: true,
          sort: 100,
          contentSort: 'asc'
        },
        name                : {
          name: 'Наименование',
          width: 200,
          show: true,
          sort: 200,
          contentSort: 'asc'
        },
        content             : {
          name: 'Содержание',
          width: 200,
          show: true,
          sort: 300,
          contentSort: 'asc'
        },
        criterion           : {
          name: 'Критерии задачи',
          width: 200,
          show: true,
          sort: 400,
          contentSort: 'asc'
        },
        showing             : {
          name: 'Показатель',
          width: 200,
          show: true,
          sort: 500,
          contentSort: 'asc'
        },
        type                : {
          name: 'Тип задачи',
          width: 200,
          show: true,
          sort: 600,
          contentSort: 'asc'
        },
        threshold           : {
          name: 'Вид задачи',
          width: 200,
          show: true,
          sort: 700,
          contentSort: 'asc'
        },
        plan                : {
          name: 'План',
          width: 200,
          show: true,
          sort: 800,
          contentSort: 'asc'
        },
        weight              : {
          name: 'Вес задачи',
          width: 100,
          show: true,
          sort: 900,
          contentSort: 'asc'
        },
        threshold_min       : {
          name: 'Мин.порог',
          width: 100,
          show: true,
          sort: 1000,
          contentSort: 'asc'
        },
        threshold_max       : {
          name: 'Макс.порог',
          width: 100,
          show: true,
          sort: 1100,
          contentSort: 'asc'
        },
        // fact                : {
        //   name: 'Факт',
        //   width: 100,
        //   show: true,
        //   sort: 1200,
        //   contentSort: 'asc'
        // },
        // fact_percent        : {
        //   name: 'Факт %',
        //   width: 100,
        //   show: true,
        //   sort: 1300,
        //   contentSort: 'asc'
        // },
        // fact_calculated     : {
        //   name: 'Оценка исп. с учетом Y в %',
        //   width: 220,
        //   show: true,
        //   sort: 1400,
        //   contentSort: 'asc'
        // },
        fact_decrease       : {
          name: 'На понижение факта',
          width: 200,
          show: true,
          sort: 1500,
          contentSort: 'asc'
        },
        link                : {
          name: 'Ссылка на задачу',
          width: 300,
          show: true,
          sort: 1600,
          //contentSort: 'asc'
        },


      },
      context         : [],
      pagination      : {
        show: 'full',
        defaultSize : paginationData.count,
        page : paginationData.page,
        changeSize : function(value){
          paginationData.count = value;
          getData();
        },
        changePage : function(value){
          paginationData.page = value;
          getData();
        }
      },
      filter          : {
        profiles : [],
        show : true,
        showProfiles : true,
        showValue : showValueFilter,
        activeProfile : activeProfile,
        filter : function(filterData_new, showValueFilter_new, activeProfile_new){
          for (let prop of Object.getOwnPropertyNames(filterData)) {
            delete filterData[prop];
          }
          let normalFilter = {};
          for (let key in filterData_new){
            if ((filterData_new[key].type === 'number' || filterData_new[key].type === 'date')         && filterData_new[key].min)                normalFilter[key] = filterData_new[key];
            if ((filterData_new[key].type === 'list'   || filterData_new[key].type === 'searchList')   && filterData_new[key].value.length > 0 )  normalFilter[key] = filterData_new[key];
          };

          showValueFilter = showValueFilter_new;

          Object.assign(filterData, normalFilter);
          activeProfile.value = activeProfile_new.value
          getData()
        },
        clear : function(data){
          for (let prop of Object.getOwnPropertyNames(filterData)) {
            delete filterData[prop];
          }
          activeProfile.value =  null;
          getData();
        },
      },
      gridId          : null,
      networkSetting  : {
        domain: '', //домен для модуля грида может отличаться от домена основного приложения. Если домен тут не указать, то примениться домен приложения
        module: 'smartCard',
        userId: userId.value,
      },
      loading         : false,
      loadJson        : function (url, data) {
        return fetch(
            content.networkSetting.domain ? content.networkSetting.domain + url : domain.value + url,
            {
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=utf-8'
              },
              body: JSON.stringify(data, function (key, val) {
                return (typeof val === 'function') ? '' + val : val;
              })
            }
        ).then(res => {
          return new Promise((resolve, reject) => {
            if (!res.ok)
              throw new Error('Response server - status code ' + res.status);
            else {
              res.json().then(json => {
                resolve(json)
              }).catch(err => {
                reject(err);
              })
            }
          })
        }).catch(err => {
          return new Promise((resolve, reject) => {
            reject({status: 'error', message: 'Некорректный ответ сервера', system: err.message})
          })
        });
      },
      sortContent     : function (sortData_new) {
        Object.assign(sortData, sortData_new);
        getData();
      },
      changing        : [],
    });

    if (route.name == 'taskTemplates'){
      content.context.push({
        text: 'Перейти в задачу',
        function: (e, row) => {
          router.push({name:'taskTemplatesEdit', params: {id: row.row.id[0].value, smartCardId : 'template', smartCardStatus : 'created' }});
        }
      });
      content.context.push({
        text: 'Удалить задачу',
        function: (e, row) => {
          let warrning = '';

          if (row.row.smart_types[0].value.length > 0){
            warrning = ' Внимание! Данный шаблон задачи добавлен к следующим типам смарт карт: '
            row.row.smart_types[0].value.forEach((el, idx) => {
              warrning = warrning + el.translate_name + (idx === row.row.smart_types[0].value.length - 1 ? ' . Эти данные будут утеряны.' : ',');
            })
          }
          ElMessageBox.confirm(`Вы уверены, что хотите удалить из шаблонов задачу с ID - ${row.row.id[0].value}?` + warrning)
              .then(() => {
                deleteTask(row.row.id[0].value);
              })
              .catch(() => {})
        }
      });
    }
    if (route.name == 'typeEdit') content.context.push({
          text: 'Выбрать задачу',
          function: (e, row) => {
            if(newTaskTemplates.indexOf(row.row.id[0].value) === -1) {
              newTaskTemplates.push(row.row.id[0].value);

              gridElements.forEach((el, idx) => {
                if(el.id[0].value === row.row.id[0].value){
                  let id = el.id[0].value;
                  gridElements[idx].id[0].value = {
                    tag          : 'span',
                    parentParams : {
                      style : {background : '#d8effd'},
                    },
                    value : id,
                  }
                  return
                }
              })
              dataGrid.methods.addElements(gridElements);
            }
          }
        }
    );
    if (route.name === 'typeEdit') content.context.push({
          text: 'Снять выделение',
          function: (e, row) => {
            let idx = newTaskTemplates.indexOf(row.row.id[0].value.value);

            if(idx !== -1) {
              gridElements.forEach((el, idx) => {
                if (el.id[0].value.value === row.row.id[0].value.value) {
                  let id = gridElements[idx].id[0].value.value;
                  gridElements[idx].id[0] = {value :id};
                  return;
                }
              })

              dataGrid.methods.addElements(gridElements);
              newTaskTemplates.splice(idx, 1);
            }
          }
        }
    );

    const dataGrid        = initGrid(content);
    provide(name.value, dataGrid);

    async function getData(filter = filterData, sort = sortData) {
      dataGrid.loading = true;
      gridElements.length = 0;
      //ниже запросили элементы для таблицы

      let result = await loadJson('/smart-card/task-templates/list', {
        count        : dataGrid.pagination.defaultSize,
        page         : dataGrid.pagination.page,
        filter       : filter,
        sort         : sort.name ? sort : {name : 'id', order : 'asc'} ,
        user_id      : userId.value,
      });

      if (result.status == 'success') {
        result.data.forEach(el => gridElements.push(el))
        dataGrid.pagination.total = result.total;

        newTaskTemplates.forEach(taskTemplate_id => {
          gridElements.forEach((el, idx) => {
            if(el.id[0].value === taskTemplate_id){
              let id = el.id[0].value;
              gridElements[idx].id[0].value = {
                tag : 'span',
                parentParams :{
                  style :  {background : '#d8effd'},
                },
                value : id,
              }
              return
            }
          })

        })

      } else notify('Проблема с получением данных', 'Возникла ошибка с получением данных с сервера.', 'error');

      dataGrid.methods.addElements(gridElements);
      dataGrid.loading = false;
    };

    async function deleteTask(template_id){
      dataGrid.loading = true;
      let result = await loadJson('/smart-card/task-templates/delete', {
        user_id      : userId.value,
        template_id,
      })
      dataGrid.loading = false;
      if(result.status === 'success') {
        await getData()
      };
      notify('Удаление шаблона задачи', result.message, result.status);
    }

    //ниже чтоб на бэк залить дефолтовый фильтр... надо выше раскоментить нужную кнопку
    async function sendDefaultFilterData() {
      //создаст моковый дефолтный фильтр. запустить один раз при разработке, чтоб он записался на бэк
      let defaultFilterData = {
        // id                  : {
        //   show: true,
        //   type: 'number',
        //   name: 'Номер',
        //   min: '',
        //   max: '',
        //   operation: '=',
        // },
        // type              : {
        //   show: true,
        //   type: 'list',
        //   name: 'Тип задачи',
        //   multiple: true,
        //   value: [],
        //   option: [
        //     {value : 'quality',   label : 'Качественный'},
        //     {value : 'financial', label : 'Финансовый'},
        //     {value : 'amount' ,   label : 'Количественный'},
        //   ],
        // },
        // threshold         : {
        //   show: true,
        //   type: 'list',
        //   name: 'Вид задачи',
        //   multiple: true,
        //   value: [],
        //   option: [
        //     {value : 0,  label : 'Без порога отсечения'},
        //     {value : 1,  label : 'С порогом отсечения'}
        //   ],
        // },
      }
      let result = await loadJson('/grid/filter/preset/default/add', {
        grid_name: name.value,
        module: dataGrid.networkSetting.module,
        data: {...defaultFilterData},
      });
      notify('Загрузка дефолтового фильтра', result.message, result.status)
    }

    return {
      loading, svg, name,
      getData, sendDefaultFilterData
    }
  },
}
</script>

<style scoped>

</style>