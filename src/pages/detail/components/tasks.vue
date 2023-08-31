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
    <el-row>
      <el-col :span = 5>
        <el-label
            :class="weights != 100 ? 'weight-red' : ''"
        >
          Суммарный вес всех задач - {{weights ? weights : 0}}%
        </el-label>
      </el-col>

      <el-col :span = 5>
        <el-label
            :class="valuation === 0 ? 'valuation-red' : ''"
            v-if="['report_prepare', 'report_approving', 'report_completed', 'completed'].includes(smartCardStatus) && kind ==='card'">
          Оценка исполнения всех задач: {{valuation ? valuation : 0  }}%
        </el-label>
      </el-col>
    </el-row>

  <div class="tasks-footer">
    <el-button
        v-if="smartCardStatus==='created' && full_access || editingAnyStatus"
        class="tasks-taskButton"
        @click="addTask"
    >
      Добавить задачу
    </el-button>
    <el-button
        v-if="(smartCardStatus==='created' || smartCardStatus==='report_prepare' || editingAnyStatus) && dataGrid.changing.length > 0 && full_access"
        class="tasks-taskButton"
        @click="changeTask"
    >
      Сохранить изменения
    </el-button>
  </div>
</div>

</template>

<script>
import { useRouter, useRoute } from 'vue-router';
import {ref, reactive, provide, inject, computed} from "vue";
import initGrid from '../../../vdg3/use/initGrid';
import Grid from '../../../vdg3/components/grid.n.vue';
import  {ElMessageBox }  from 'element-plus';
export default {
  name: "tasks",
  components: {Grid},
  props: ['kind', 'type_id'],
  setup(props){
    const smartCardId      = inject('smartCardId', null);
    const smartCardStatus  = inject('smartCardStatus');
    const userId           = inject('userId');
    const full_access      = inject('full_access');
    const domain           = inject('domain');
    const loadJson         = inject('loadJson');
    const notify           = inject('notify');
    const svg              = inject('svg');
    let weights            = inject('weights');
    let valuation          = inject('valuation');

    let paginationData     = inject('paginationDataTasks');
    let sortData           = inject('sortDataTasks');
    let filterData         = inject('filterDataTasks');
    let showValueFilter    = inject('showValueTasksFilter');
    let activeProfile      = inject('activeProfileTasks');

    const editingAnyStatus = inject('editingAnyStatus');

    const router           = useRouter();
    const route            = useRoute();
    const loading          = computed(() => { return dataGrid.loading });
    const name             = ref('smartCardTasks');
    const content          = reactive({
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
        fact                : {
          name: 'Факт',
          width: 100,
          show: true,
          sort: 1200,
          contentSort: 'asc'
        },
        fact_percent        : {
          name: 'Факт %',
          width: 100,
          show: true,
          sort: 1300,
          contentSort: 'asc'
        },
        fact_calculated     : {
          name: 'Оценка исп. с учетом Y в %',
          width: 220,
          show: true,
          sort: 1400,
          contentSort: 'asc'
        },
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
        files                : {
          name: 'Прикрепленные файлы',
          width: 300,
          show: true,
          sort: 1700,
          //contentSort: 'asc'
        },
      },
      context         : [
        {
          text: 'Перейти в задачу',
          function: (e, row) => {
            router.push({name:'taskEdit', params: { id: row.row.id[0].value, smartCardId : route.params.id, smartCardStatus : smartCardStatus.value, type_id : props.type_id }});
          }
        },
        // ниже в коде после объявления переменной content есть добавление контекста для удаления задачи если статус SMART-карты - created
      ],
      pagination      : {
        show: 'none',
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
        show : false,
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

    if (smartCardStatus.value === 'created' && full_access.value || editingAnyStatus.value) content.context.push(
        {
          text: 'Удалить задачу',
          function: (e, row) => {
            ElMessageBox.confirm(`Вы уверены, что хотите удалить задачу с ID - ${row.row.id[0].value}?`)
                .then(() => {
                  deleteTask(row.row.id[0].value);
                })
                .catch(() => {})
          }
        }
    );

    const dataGrid        = initGrid(content);
    provide(name.value, dataGrid);

    async function getData(filter = filterData, sort = sortData) {
      dataGrid.loading = true;
      //ниже если SMART-карта в статусе составления то надо отслеживать общий вес задач weights
      if (smartCardStatus.value === 'created') {
        let result = await loadJson('/smart-card/tasks/weights', {user_id: userId.value, smartcard_id: smartCardId.value})
        if (result.status == 'success' && result.data) {
          weights.value = null;
          result.data.forEach(el => weights.value = weights.value + el.weight)
        }
      }

      //ниже запросили элементы для таблицы
      let gridElements = [];
      let result = await loadJson('/smart-card/tasks/list', {
        smartcard_id : smartCardId.value,
        user_id      : userId.value,
        count        : dataGrid.pagination.defaultSize,
        page         : dataGrid.pagination.page,
        filter       : filter,
        sort         : sort.name ? sort : {name : 'id', order : 'asc'} ,
      });

      // let result = {
      //   status : 'success',
      //   total  : 2,
      //   data   :  [
      //     {
      //       id                  : [{value : 'Качественный'}],
      //       name                : [{value : 'Качественный'}],
      //       content             : [{value : 'Качественный'}],
      //       criterion           : [{value : {tag : 'span', parentParams :{style : {background : '#ffecec'}}, value : 'Отчет сформирован'}}],
      //       //criterion           : [{value : 'Качественный'}],
      //       showing             : [{value : 'Без порога отсечения'}],
      //       type                : [{value : 'Качественный'}],
      //       threshold           : [{value : 'Вид задачи'}],
      //       plan                : [{value : 'Задача выполнена 1'}],
      //       weight              : [{value : {tag : 'span',  value : {
      //                                                                                                     value : 50,
      //                                                                                                     tag : 'el-input',
      //                                                                                                     params : {style : {width : '80px'}}
      //                                                                                                   }
      //                                        }
      //       }],
      //       threshold_min       : [{value : {tag : 'span', value : {
      //                                                                 value : 0,
      //                                                                 tag : 'el-input',
      //                                                                 params : {style : {width : '80px'}, disabled : true}
      //                                                              }
      //                                       }
      //                             }],
      //       threshold_max       : [{value : {tag : 'span', value : {
      //             value : 0,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}, disabled : true}
      //           } }}],
      //       fact                : [{value : {tag : 'span', value : {
      //             value : 3,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}}
      //           } }}],
      //       fact_percent        : [{value : {tag : 'span', value : {
      //             value : 5,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}}
      //           } }}],
      //       fact_calculated     : [{value : {tag : 'span', value : {
      //             value : 5,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}}
      //           } }}],
      //       link                : [{value : 'xfhjdfhjdfjcg'}],
      //     },
      //     {
      //       id                  : [{value : 2}],
      //       name                : [{value : 'Придумать новый отчет 2'}],
      //       content             : [{value : 'Сделать отчет в Excel 2'}],
      //       criterion           : [{value : 'Отчет сформирован 2'}],
      //       showing             : [{value : 'Без порога отсечения'}],
      //       type                : [{value : 'Качественный'}],
      //       threshold           : [{value : 'Вид задачи'}],
      //       plan                : [{value : 'Задача выполнена 1'}],
      //       weight              : [{value : {tag : 'span', value : {
      //             value : 50,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}}
      //           } }}],
      //       threshold_min       : [{value : {tag : 'span', value : {
      //             value : 0,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}, disabled : true}
      //           }
      //         }
      //       }],
      //       threshold_max       : [{value : {tag : 'span', value : {
      //             value : 0,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}, disabled : true}
      //           } }}],
      //       fact                : [{value : {tag : 'span', value : {
      //             value : 3,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}}
      //           } }}],
      //       fact_percent        : [{value : {tag : 'span', value : {
      //             value : 5,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}}
      //           } }}],
      //       fact_calculated     : [{value : {tag : 'span', value : {
      //             value : 5,
      //             tag : 'el-input',
      //             parentParams : {style : {width : '80px'}}
      //           } }}],
      //       link                : [{value : 'xfhjdfhjdfjcg'}],
      //     },
      //
      //   ],
      // }

      if (result.status == 'success') {
        gridElements = result.data
        dataGrid.pagination.total = result.total;
      } else notify('Проблема с получением данных', 'Возникла ошибка с получением данных с сервера.', 'error');

      dataGrid.methods.addElements(gridElements);
      dataGrid.loading = false;
    };

    function addTask(){
      router.push({name:'taskAdd', params: { id: smartCardId.value }});

    };

    async function changeTask(){
      let dataToSave = [];

      dataGrid.changing.forEach(el => {
        let exist = dataToSave.find(item => {return item.task_id === el.id});
        exist ? exist[el.name] = el.newValue : dataToSave.push({task_id : el.id, [el.name] : el.newValue})
      })

      dataGrid.loading = true;
      let result = await loadJson('/smart-card/tasks/edit', {
        user_id      : userId.value,
        smartcard_id : smartCardId.value,
        data         : dataToSave,
      })
      dataGrid.loading = false;

      if(result.status === 'success') {
        dataGrid.changing.length = 0;
        valuation.value = result.data.valuation ? result.data.valuation : null;
        await getData()
      };
      notify('Сохранение изменений ', result.message, result.status);

    }

    async function deleteTask(task_id){
      dataGrid.loading = true;
      let result = await loadJson('/smart-card/tasks/delete', {
        user_id      : userId.value,
        smartcard_id : smartCardId.value,
        task_id,
      })
      dataGrid.loading = false;
      if(result.status === 'success') {
        await getData()
      };
      notify('Удаление задачи ', result.message, result.status);
    }

    return{
      svg, loading, name, dataGrid, smartCardStatus, weights, valuation, full_access, editingAnyStatus,
      getData, addTask, changeTask
    }
  },
}
</script>

<style scoped>

</style>