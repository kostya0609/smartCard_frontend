<template>
  <div
      v-loading="loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="app_container"
  >
    <div v-if="isToken">
      <navBar v-if="navBarVisible"/>
      <router-view/>
    </div>

    <br v-else/>

  </div>
</template>

<script>
import navBar from "./components/navBar";
import {ref, reactive, provide, computed} from "vue";
import { useRouter, useRoute } from 'vue-router';
import  {ElNotification}  from 'element-plus'

export default {
  name : 'App',
  components : {navBar},
  setup(){
    const svg              = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
    const loading          = ref(false);
    const isToken          = ref(null);
    const timerId          = ref(null);
    const router           = useRouter();

    const userId           = ref(null);
    const userFIO          = ref(null);
    const userRole         = reactive([]);
    const full_access      = ref(false);
    const userDepartment   = reactive({
      value : null,
      label : null
    });
    const token            = ref(null);
    const domain           = ref( process.env.NODE_ENV == 'production' ? window.location.origin + '/api' : 'https://vc.bsi.local');
    //const domain           = ref( 'https://bitrix.bsi.local/api');
    //const domain           = ref( 'https://vc.bsi.local');

    const notify           = (title, message, type) => {
      ElNotification({
        title: title,
        message: message,
        type: type,
        duration: 4000,
      })
    };

    const editingAnyStatus = ref(false);

    const smartCardId      = ref(null);
    const smartCardStatus  = ref(null);
    let processId          = ref(null);

    const navBarVisible    = computed(() => {
      let currentRoute = router.currentRoute.value.name;
      return['listAll', 'listAttention', 'access', 'types', 'taskTemplates'].includes(currentRoute)
    });

    const map              = {
      created           : 'Подготовка плана',
      approving         : 'Согласование плана',
      working           : 'Задачи в работе',
      report_prepare    : 'Подготовка отчета по работе',
      report_approving  : 'Согласование отчета',
      report_completed  : 'Отчет согласован',
      completed         : 'Принят',
    };

    // ниже нужно для форм создания и редактирования самрт карт и в деталке
    const kindList         = reactive([
      {value : 'card',      label : 'SMART-карта'},
      {value : 'plan',      label : 'План'}
    ])
    const typeList         = reactive([]);
    const monthList        = reactive([
      {value : 1,  label : 'Январь'},
      {value : 2,  label : 'Февраль'},
      {value : 3,  label : 'Март'},
      {value : 4,  label : 'Апрель'},
      {value : 5,  label : 'Май'},
      {value : 6,  label : 'Июнь'},
      {value : 7,  label : 'Июль'},
      {value : 8,  label : 'Август'},
      {value : 9,  label : 'Сентябрь'},
      {value : 10, label : 'Октябрь'},
      {value : 11, label : 'Ноябрь'},
      {value : 12, label : 'Декабрь'},
    ]);
    const quarterList      = reactive([
      {value : 1, label : '1'},
      {value : 2, label : '2'},
      {value : 3, label : '3'},
      {value : 4, label : '4'},
    ]);
    const periodList       = reactive([
      {value : 'month',   label : 'Месяц'},
      {value : 'quarter', label : 'Квартал'},
      {value : 'year',    label : 'Год'},
    ]);
    ///////////////////////////////////////////////////////////
    const usersData        = reactive([]);

    const newTaskTemplates = reactive([]);

    let paginationDataListAll         = reactive({page : 1, count : 10});
    let sortDataListAll               = reactive({name: "id", order: "desc"});
    let filterDataListAll             = reactive({});
    let showValueListAllFilter        = reactive([]);
    let activeProfileListAll          = ref(null);

    let paginationDataListAttention   = reactive({page : 1, count : 10});
    let sortDataListAttention         = reactive({});
    let filterDataListAttention       = reactive({});
    let showValueListAttentionFilter  = reactive([]);
    let activeProfileListAttention    = ref(null);

    let paginationDataTasks           = reactive({page : 1, count : 10});
    let sortDataTasks                 = reactive({});
    let filterDataTasks               = reactive({});
    let showValueTasksFilter          = reactive([]);
    let activeProfileTasks            = ref(null);

    let paginationDataTaskTemplates   = reactive({page : 1, count : 10});
    let sortDataTaskTemplates         = reactive({});
    let filterDataTaskTemplates       = reactive({});
    let showValueTaskTemplatesFilter  = reactive([]);
    let activeProfileTaskTemplates    = ref(null);

    function loadJson(url , data, type, downloadRequest){
      let body, header = {};

      if(type === 'file'){
        body = data;
      }else{
        body = {...data};
        header['Content-Type'] = 'application/json;charset=utf-8';
      }

      return fetch(
          domain.value + url,
          {
            method: 'post',
            headers: header,
            body: type === 'file' ? body : JSON.stringify(body, function(key, val) {
              return (typeof val === 'function') ? ''+ val : val;
            })
          }
      ).then(res => {
        return new Promise((resolve,reject) => {
          if(!res.ok)
            throw new Error('Response server - status code ' + res.status);
          else{

            if (downloadRequest) {
              resolve(res)
            } else {
              res.json().then(json => {
                resolve(json)
              }).catch(err => {
                reject(err);
              })
            }

          }
        })
      }).catch(err => {
        return new Promise((resolve,reject) => {
          reject({status : 'error',message : 'Некорректный ответ сервера',system : err.message})
        })
      });
    };

    async function initData(){
      window._userId ? userId.value = window._userId : userId.value = null;
      window._token  ? window.token = window._token  : window.token = null;
    }

    async function auth(){
      loading.value = true;
      await initData();
      if (window.token) {
        setTimeout(() => {clearInterval(timerId.value)});

        let result = await loadJson('/smart-card/get-user', {user_id: userId.value, token : window.token});

        if (result.status == 'success' && result.data) {
          userRole.length = 0;
          result.data.roles.forEach(el => userRole.push(el));
          userFIO.value = result.data.user.label;
          userDepartment.value = result.data.department.value;
          userDepartment.label = result.data.department.label;

          editingAnyStatus.value = userRole.includes('editing_any_status') ? true : false; // добавили супер право менять задачи в любом статусе

          isToken.value = true;
        } else notify('Проблема с получением данных', 'Возникла ошибка с получением данных с сервера.', 'error');

        // ниже запросили типы SMART-карт
        result = await loadJson('/smart-card/type/get', {});
        if (result.status == 'success' && result.data) {
          typeList.length = 0;
          result.data.forEach(el => typeList.push(el) )
        }
      loading.value = false;
      } else {
        userRole.length = 0;
        isToken.value  = false;
        notify('Проблема с авторизацией на портале', 'Нет токена.', 'error');
        timerId.value  = setInterval(async () => await initData(), 15000 );
      };
    };
    auth();

    function formatNumber(number){
      if (number > 0){
        return (+number).toLocaleString('ru-RU',{ minimumFractionDigits : 2 }).replace(',', '.');
      }
    }

    window.loadFile = async (id, fileName, type) => {
      try {
        let result    = await loadJson('/smart-card/load-file', {file_id : id}, '', true);
        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      }catch(e){
        notify('Ошибка загрузки файла', e.message, 'error')
      }
      return false;
    };

    provide('domain', domain);
    provide('userId', userId);
    provide('userRole', userRole);
    provide('full_access', full_access);
    provide('userFIO', userFIO);
    provide('userDepartment', userDepartment);
    provide('token', token);

    provide('loadJson', loadJson);
    provide('notify', notify);

    provide('svg', svg);

    provide('smartCardId', smartCardId);
    provide('smartCardStatus', smartCardStatus);
    provide('processId', processId);

    provide('editingAnyStatus', editingAnyStatus);

    provide('kindList', kindList);
    provide('typeList', typeList);
    provide('monthList', monthList);
    provide('quarterList', quarterList);
    provide('periodList', periodList);
    provide('map', map);
    provide('formatNumber', formatNumber)

    provide('usersData', usersData);
    provide('newTaskTemplates', newTaskTemplates);

    provide('paginationDataListAll', paginationDataListAll);
    provide('sortDataListAll', sortDataListAll);
    provide('filterDataListAll', filterDataListAll);
    provide('showValueListAllFilter', showValueListAllFilter);
    provide('activeProfileListAll', activeProfileListAll);

    provide('paginationDataListAttention', paginationDataListAttention);
    provide('sortDataListAttention', sortDataListAttention);
    provide('filterDataListAttention', filterDataListAttention);
    provide('showValueListAttentionFilter', showValueListAttentionFilter);
    provide('activeProfileListAttention', activeProfileListAttention);

    provide('paginationDataTasks', paginationDataTasks);
    provide('sortDataTasks', sortDataTasks);
    provide('filterDataTasks', filterDataTasks);
    provide('showValueTasksFilter', showValueTasksFilter);
    provide('activeProfileTasks', activeProfileTasks);

    provide('paginationDataTaskTemplates', paginationDataTaskTemplates);
    provide('sortDataTaskTemplates', sortDataTaskTemplates);
    provide('filterDataTaskTemplates', filterDataTaskTemplates);
    provide('showValueTaskTemplatesFilter', showValueTaskTemplatesFilter);
    provide('activeProfileTaskTemplates', activeProfileTaskTemplates);

    return {navBarVisible, isToken, svg, loading}
  },
}
</script>

<style>
/* ниже стили общие на все приложение*/

#workarea {
  overflow-x: hidden!important;
}
#workarea-content {
  overflow: unset !important;
}
.workarea-content-paddings{
  overflow-x: unset !important;
}
.app_container{

}
#app ::selection {
  background: #cfcfcf;
}

.el-table .cell{
  word-break: break-word!important;
}

.el-row{
  margin-bottom: 15px;
}
.badgeItem {
  position: absolute;
  top: -20px;
  right: 0px;
  z-index: 10;
  color: white;
  background: #f56c6c;
  border-radius: 20px;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  font-size: 12px!important;
  width: 25px;
  height: 25px;
}

/*Общий класс - если не все поля на форме заполнены*/
small {
  color: #ff2400;
}
.invalid {
  border:solid 1px;
  border-color: #ff2400;
}
.weight-red{
  color: #ff2400;
}
.valuation-red{
  color: #ff2400;
}

/* ниже стили для отдельного компонента  - Меню navBar */
.el-menu--horizontal{
  display: block !important;
}
.menu-right-element{
  float: right !important;
  padding-top: 10px!important;
}
.menu-right-element-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.menu-right-element-button:hover{
  background: #3fddff !important;
}
.el-menu-item.menu-right-element{
  padding-right: 0px!important;
}
.el-menu--horizontal .el-menu-item:focus{
  background-color: #ffffff!important;
}
.el-menu--horizontal .el-menu-item:hover:last-child{
  background-color: #ffffff!important;
}
.el-menu--horizontal>.el-menu-item.is-active
{
  background-color: #ecf5ff!important;
}

/* нижи стили для отдельного компонента return_button - кнопка Вернуться назад*/
.returnButton{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.returnButton:hover{
  background: #3fddff !important;
}

/* Ниже стили для отдельного компанента logs */
.logs-label{
  font-weight: bold;
  text-decoration: underline;
}
.logs-table{
  width: 100%;
  border: solid 1px #e1e2e5!important;
  margin-top: 10px;
}
span.userPhoto {
  border-radius: 50%;
  overflow: hidden;
  display: block;
  width: 32px;
  height: 32px;
}
.userPhoto img{
  width: 32px;
}

/* Страница smart_card_add  и ее же стили используются при редактировании SMART-карты*/
.smartCardAdd-header{
  display: flex;
  justify-content: space-between;
}
.smartCardAdd-label{
  font-weight: 500;
  margin-bottom: 5px!important;
}
.smartCardAdd-element{
  width: 100% !important;
}
.smartCardAdd-footer{
  display: flex;
  justify-content: flex-start;
}

.smartCardAdd-footer-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.smartCardAdd-footer-button:hover{
  background: #3fddff !important;
}

/* Страница detail */
.detail-header{
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

/* ниже стили страници деталки -  вкладка основной информации о SMART-карте */

.info-container{
  /*padding: 10px;*/
}
.info-title{
  font-weight: bold;
  text-align: right;
  margin: auto 0;
  padding-right: 10px;
}

.info-title+.el-col{
  padding-left: 10px!important;
}
.executor-row{
  margin-bottom: 6px;
}
.executor{
  margin: auto 0;
}
.info-footer{
  text-align: center;
  display: inline-block;
  float: left;
  width: 100%;
  /*display: grid;*/
  /*grid-template-columns: 32% 32% 32%;*/
  /*grid-gap: 2%;*/
  /*padding-right: 22px;*/
}
.info-footer .el-button{
  text-transform: uppercase!important;
  width: 185px;
  margin: 10px 10px;
  font-size: 13px;
  color : white !important;
}
.info-footer .approving{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
}
.info-footer .approving:hover{
  background: #3fddff !important;
}
.info-footer .editing{
  background: #909399 !important;
  border-color: #909399 !important;
}
.info-footer .editing:hover{
  background: #a3a7af !important;
}
.info-footer .deleting{
  background: #f56c6c !important;
  border-color: #f56c6c !important;
}
.info-footer .deleting:hover{
  background: #fd4949 !important;
}

/* ниже стили Страницы деталки и вкладка с задачами tasks */
.tasks-footer{
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.tasks-taskButton{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.tasks-taskButton:hover{
  background: #3fddff !important;
}

/* ниже стили страницы добавления задач и они же для редактирования задач */
.taskAdd-header{
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.taskAdd-label{
  font-weight: 500;
}
.taskAdd-element{
  width: 100%;
}
.taskAdd-footer{
  display: flex;
  justify-content: flex-start;
}
.taskEdit-footer{
  display: flex;
  justify-content: space-between;
}
.taskTemplateAdd-footer{
  display: flex;
  justify-content: flex-end;
}
.taskEdit-footer{
  display: flex;
  justify-content: space-between;
}

.taskTemplates{
  border: #c0c4cc 1px solid;
  padding: 0px 20px 20px 20px;
}

.taskAdd-footer-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.taskAdd-footer-button:hover{
  background: #3fddff !important;
}

/* Ниже стили страницы  деталки и вкладка с дополнительными параметрами и KPI */
.options-container{
  padding: 10px;
}

.options-label{
  font-weight: 500;
}
.options-element{
  width: 100%;
}
.options-footer{
  display: flex;
  justify-content: flex-start;
}

.options-footer-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.options-footer-button:hover{
  background: #3fddff !important;
}

/* Ниже стили страницы  деталки и вкладка с Бизнес процессами */
.business-container{
  /*padding: 10px;*/
}

.change-status{
  background: #f56c6c !important;
  border-color: #f56c6c !important;
  color: white!important;
}

/*ниже стили страницы с правами */
.access-container{
  padding: 10px;
}

/* ниже стили страницы добавления пользователей*/

.userAdd-header{
  display: flex;
  justify-content: space-between;

}
.userAdd-label{
  font-weight: 500;
}
.userAdd-element{
  width: 100%;
  margin-top: 5px;
}
.userAdd-footer{
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.userAdd-footer-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.userAdd-footer-button:hover{
  background: #3fddff !important;
}

/*ниже стили страницы с типами */
.type-container{
  padding: 10px;
}
.typeAdd-element{
  width: 100%;
}
.typeAdd-header{
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.typeAdd-label{
  font-weight: 500;
}
.typeAdd-footer{
  display: flex;
  justify-content: flex-start;
}

.typeAdd-footer-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.typeAdd-footer-button:hover{
  background: #3fddff !important;
}
.type-add-edit-col{
  display: flex;
  align-items: center;
}
.el-table__expanded-cell{
  text-align: center !important;
}






</style>
