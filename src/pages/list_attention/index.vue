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

    <el-link
        href="/disk/showFile/721398/?&ncc=1&ts=1679359118&filename=%D0%9C%D0%B0%D1%80%D1%88%D1%80%D1%83%D1%82%D1%8B+%D1%81%D0%BE%D0%B3%D0%BB%D0%B0%D1%81%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F+Smart-%D0%BA%D0%B0%D1%80%D1%82.xlsx"
        target="_blank"
        type="danger"
    >
      Маршруты согласования Smart-карт.
    </el-link>


    <!--        <el-button @click="sendDefaultFilterData">-->
<!--          Загрузить дефолтовый фильтр-->
<!--        </el-button>-->

  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import {ref, reactive, provide, inject, computed} from "vue";
import initGrid from '../../vdg3/use/initGrid';
import Grid from '../../vdg3/components/grid.n.vue';
import  {ElMessageBox }  from 'element-plus';
export default {
  name: "listAttentionIndex",
  components: {Grid},
  setup(){
    const smartCardId  = inject('smartCardId', null);
    const userId       = inject('userId');
    const domain       = inject('domain');
    const loadJson     = inject('loadJson');
    const notify       = inject('notify');
    const svg          = inject('svg');

    let paginationData  = inject('paginationDataListAttention');
    let sortData        = inject('sortDataListAttention');
    let filterData      = inject('filterDataListAttention');
    let showValueFilter = inject('showValueListAttentionFilter');
    let activeProfile   = inject('activeProfileListAttention');

    const router       = useRouter();


    const loading      = computed(() => { return dataGrid.loading });

    const name         = ref('smartCardListAttention');

    const content      = reactive({
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
          width: 300,
          show: true,
          sort: 200,
          //contentSort: 'asc'
        },
        kind                : {
          name: 'Вид',
          width: 300,
          show: true,
          sort: 300,
          contentSort: 'asc'
        },
        type                : {
          name: 'Тип SMART-карты',
          width: 300,
          show: true,
          sort: 400,
          contentSort: 'asc'
        },
        executor            : {
          name: 'Исполнитель',
          width: 300,
          show: true,
          sort: 500,
          //contentSort: 'asc'
        },
        department          : {
          name: 'Департамент',
          width: 300,
          show: true,
          sort: 600,
          //contentSort: 'asc'
        },
        status              : {
          name: 'Статус',
          width: 200,
          show: true,
          sort: 700,
          contentSort: 'asc'
        },
        period_type         : {
          name: 'Период',
          width: 300,
          show: true,
          sort: 800,
          contentSort: 'asc'
        },
        period_value        : {
          name: 'Отчетный период',
          width: 300,
          show: true,
          sort: 900,
          contentSort: 'asc'
        },
        year                : {
          name: 'Год отчетного периода',
          width: 400,
          show: true,
          sort: 1000,
          contentSort: 'asc'
        },
        plan_signatory      : {
          name: 'Подписант плана',
          width: 300,
          show: true,
          sort: 1100,
          //contentSort: 'asc'
        },
        report_signatory    : {
          name: 'Подписант отчета',
          width: 300,
          show: true,
          sort: 1200,
          //contentSort: 'asc'
        },
        created_at          :{
          name: 'Дата создания',
          width: 400,
          show: true,
          sort: 1300,
        },
        comment             : {
          name: 'Комментарий',
          width: 400,
          show: true,
          sort: 1400,
        },
      },
      context         : [
        {
          text: 'Перейти в SMART-карту',
          function: (e, row) => {
            smartCardId.value = row.row.id[0].value;
            router.push({name:'detail', params: { id: row.row.id[0].value }});
          }
        },
      ],
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
        profiles: [],
        show: true,
        showProfiles: true,
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
        sortData_new.name === 'type' ? sortData_new.name = 'type_id' : '';
        Object.assign(sortData, sortData_new);
        getData();
      },
    });
    const dataGrid     = initGrid(content);
    provide(name.value, dataGrid);

    async function getData(filter = filterData, sort = sortData) {
      dataGrid.loading = true;

      //ниже запросили элементы для таблицы
      let gridElements = [];
      let result = await loadJson('/smart-card/list-actions', {
        count  : dataGrid.pagination.defaultSize,
        page   : dataGrid.pagination.page,
        filter : filter,
        sort   : sort.name ? sort : {name : 'id', order : 'asc'} ,
        user_id : userId.value,
      });


      if (result.status == 'success') {
        gridElements = result.data
        dataGrid.pagination.total = result.total;
      } else notify('Проблема с получением данных', 'Возникла ошибка с получением данных с сервера.', 'error');

      dataGrid.methods.addElements(gridElements);
      dataGrid.loading = false;
    };

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
        // kind                : {
        //   show: true,
        //   type: 'list',
        //   name: 'Вид',
        //   multiple: true,
        //   value: [],
        //   option: [
        //     {value: 'card', label: 'SMART-карта'},
        //     {value: 'plan', label: 'План'},
        //   ],
        // },
        // type                : {
        //   show: true,
        //   type: 'list',
        //   name: 'Тип SMART-карты',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   focus : async function (){
        //     let result = await grid.loadJson('/smart-card/type/get', {});
        //     if (result.status === 'success' && result.data) return result.data;
        //   },
        // },
        // executor_id         : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Исполнитель',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/smart-card/search/user', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        department_id         : {
          show: true,
          type: 'searchList',
          name: 'Департамент',
          multiple: true,
          value: [],
          option: [],
          query: async function (data) {
            let result = await grid.loadJson('/smart-card/search/department', {
              q: data,
            });
            if (result.status == 'success') return result.data
          },
        },
        // status              : {
        //   show: true,
        //   type: 'list',
        //   name: 'Статус',
        //   multiple: true,
        //   value: [],
        //   option: [
        //     {value: 'created',          label: 'Подготовка плана'},
        //     {value: 'approving',        label: 'Согласование плана'},
        //     {value: 'working',          label: 'Задачи в работе'},
        //     {value: 'report_prepare',   label: 'Подготовка отчета по работе'},
        //     {value: 'report_approving', label: 'Согласование отчета'},
        //     {value: 'report_completed', label: 'Отчет согласован'},
        //     {value: 'completed ',       label: 'Принят'},
        //   ],
        // },
        // period_month        : {
        //   show: true,
        //   type: 'list',
        //   name: 'Месяц SMART-карты',
        //   multiple: true,
        //   value: [],
        //   option: [
        //     {value : 1,  label : 'Январь'},
        //     {value : 2,  label : 'Февраль'},
        //     {value : 3,  label : 'Март'},
        //     {value : 4,  label : 'Апрель'},
        //     {value : 5,  label : 'Май'},
        //     {value : 6,  label : 'Июнь'},
        //     {value : 7,  label : 'Июль'},
        //     {value : 8,  label : 'Август'},
        //     {value : 9,  label : 'Сентябрь'},
        //     {value : 10, label : 'Октябрь'},
        //     {value : 11, label : 'Ноябрь'},
        //     {value : 12, label : 'Декабрь'},
        //   ],
        // },
        // period_quarter      : {
        //   show: true,
        //   type: 'list',
        //   name: 'Квартал SMART-карты',
        //   multiple: true,
        //   value: [],
        //   option: [
        //     {value : 1, label : '1'},
        //     {value : 2, label : '2'},
        //     {value : 3, label : '3'},
        //     {value : 4, label : '4'},
        //   ],
        // },
        // year                : {
        //   show: true,
        //   type: 'list',
        //   name: 'Год SMART-карты',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   focus : async function (){
        //     let current = (new Date()).getFullYear();
        //     let years = [];
        //     for(let i = current - 3; i <= current; i++ ){
        //       years.push( {value : i, label : i})
        //     };
        //     return years;
        //   },
        // },
        // plan_signatory   : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Подписант плана',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/smart-card/search/user', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        // report_signatory : {
        //   show: true,
        //   type: 'searchList',
        //   name: 'Подписант отчета',
        //   multiple: true,
        //   value: [],
        //   option: [],
        //   query: async function (data) {
        //     let result = await grid.loadJson('/smart-card/search/user', {
        //       q: data,
        //     });
        //     if (result.status == 'success') return result.data
        //   },
        // },
        // created_at: {
        //   show: true,
        //   type: 'date',
        //   name: 'Дата создания',
        //   min: '',
        //   max: '',
        //   operation: '=',
        // },
      };
      let result = await loadJson('/grid/filter/preset/default/add', {
        grid_name: name.value,
        module: dataGrid.networkSetting.module,
        data: {...defaultFilterData},
      });
      notify('Загрузка дефолтового фильтра', result.message, result.status)
    }

    return{
      svg, loading, name,
      getData, sendDefaultFilterData
    }
  }
}
</script>

<style scoped>

</style>
