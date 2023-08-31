<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <div class="userAdd-header">
      <h3>Редактирование пользователя: </h3>
      <returnButton/>
    </div>
    <p>ФИО - {{route.params.user_name}}, роль - {{roleName}}</p>

    <el-row>
      <el-col :span="8">
        <label class="userAdd-label">Тип</label>
        <el-select
          v-model="type"
          :class="['userAdd-element']"
          style="width: 100%"
          placeholder="Отдел"
          @change="individualList.length = 0; individual = null; departmentList.length = 0; department = null"
      >
        <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        >
        </el-option>
      </el-select>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="8" style="margin-right: 10px">
        <template v-if="type === 'individual'">
          <label class="userAdd-label">Сотрудник</label>
          <el-select
              v-model="individual"
              class="userAdd-element"
              style="width: 100%"
              filterable
              remote
              reserve-keyword
              :remote-method="searchIndividual"
              placeholder="Сотрудник"
          >
            <el-option
                v-for="item in individualList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
        </template>
        <template v-else>
          <label class="userAdd-label">Отдел</label>
          <el-select
              v-model="department"
              class="userAdd-element"
              style="width: 100%"
              filterable
              remote
              reserve-keyword
              :remote-method="searchDepartment"
              placeholder="Отдел"
          >
            <el-option
                v-for="item in departmentList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
        </template>
        <label class="userAdd-label"><br/></label>
        <el-table
            :data="tableData"
        >
          <el-table-column  prop="name" label="Название отдела"/>
          <el-table-column label="Действие" align="center" width="180">
            <template #default="scope">
              <el-button
                  size="small"
                  type="danger"
                  @click="userDelete(scope.$index, scope.row)"
              >
                <el-icon><CloseBold /></el-icon>
              </el-button>
              <el-switch
                  v-model="scope.row.full_access"
                  style="margin-left: 15px"
                  size="small"
                  active-text="full"
                  inactive-text="read"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="2">
        <label class="add_user_label"><br/></label>
        <el-button
            style="margin-top: 5px"
            class="menu-right-element-button"
            @click="userAdd"
        >
          +
        </el-button>
      </el-col>
    </el-row>

    <div class="userAdd-footer">
      <el-button
          class="userAdd-footer-button"
          @click="saveUser"
          :disabled="tableData.length == 0"
      >
        Сохранить
      </el-button>
    </div>
  </div>
</template>

<script>
import returnButton from "../../components/return_button";
import {useRoute, useRouter} from "vue-router";
import {inject, reactive, ref} from "vue";
import {ElMessageBox} from "element-plus";

export default {
  name: "userEdit",
  components: {returnButton},
  setup(){
    const loadJson        = inject('loadJson');
    const notify          = inject('notify');
    const svg             = inject('svg');
    const userId          = inject('userId');

    const router          = useRouter();
    const loading         = ref(false);

    const tableData       = reactive([]);
    const usersData       = inject('usersData');
    usersData.forEach(el => tableData.push(el) );

    const type            = ref('individual');
    const typeList        = reactive([{value : 'individual', label : 'Сотрудник'},{value : 'department', label : 'Отдел'}]);

    const department     = ref(null) //выбранное значение в select
    const departments    = reactive([]);// актуальный сохраненный список отделов с которым работаем
    const departmentList = reactive([]);// список после поиска для select

    const individual     = ref(null);
    const individuals    = reactive([]);
    const individualList = reactive([]);

    const roleName       = ref(null);

    const route          = useRoute();

    function searchIndividual(query){
      let url = '/smart-card/search/user';
      if (query !== '')
        search(query,'individual', url);
    };

    function searchDepartment(query){
      let url = '/smart-card/search/department';
      if (query !== '')
        search(query,'department', url);
    };

    async function search(query, key, url){
      let result = await loadJson(url, {q: query});
      if (result.status === 'success') {

        if (key === 'individual') {
          individualList.length = 0;
          result.data.forEach(el => individualList.push(el));
        };

        if (key === 'department') {
          departmentList.length = 0;
          result.data.forEach(el => departmentList.push(el));
        };

      };
    };

    async function getData(){
      loading.value = true
      let result = await loadJson('/smart-card/role/get');
      if (result.status == 'success') {
        result.data.forEach(el => {
          el.value == route.params.role_id ? roleName.value = el.label : ''
        });
      }
      loading.value = false
    };
    getData();

    function userAdd(){
      let name = null;
      if(type.value == 'individual'){
        individualList.forEach(el => {
          el.value === individual.value ? name = el.label : '';
        })
      } else {
        departmentList.forEach(el => {
          el.value === department.value ? name = el.label : '';
        })
      }

      let entity_id = type.value == 'individual' ? individual.value : department.value;

      if (!tableData.find(el => (el.entity_id == entity_id && el.type == type.value))) {

        tableData.push({name, type : type.value, entity_id, full_access : false});

        if(type.value == 'individual'){
          individualList.length = 0;
          individual.value = null;
        } else {
          departmentList.length = 0;
          department.value = null;
        }

      } else notify(`Добавление ${type.value == 'individual' ? 'сотрудника' : 'отдела'}`, `Данный ${type.value == 'individual' ? 'сотрудник' : 'отдел'}  был добавлен ранее`, 'error');

    };

    function userDelete(index, row){
      ElMessageBox.confirm(`Вы уверены, что хотите удалить ${type.value == 'individual' ? 'сотрудника' : 'отдел'} ${row.name} ?`)
          .then(() => {
            tableData.splice(index,1);
          })
          .catch(() => {})
    };

    async function saveUser(){
      loading.value = true
      let individuals = [], departments = [];

      tableData.forEach(el => el.type == 'individual' ?
          individuals.push({entity_id : el.entity_id, full_access : el.full_access}) :
          departments.push({entity_id : el.entity_id, full_access : el.full_access})
      );

      let result = await loadJson('/smart-card/role/additional/set', {
        user_id   : userId,
        client_id : route.params.user_id,
        role_id   : route.params.role_id,
        individuals,
        departments
      });

      if (result.status == 'success') {
        usersData.length = 0;
        await router.push({name: 'access', params :{page : 'extended'}})
      }
      loading.value = false
      notify('Изменение пользователя', result.message, result.status)
    };

    return{
      route, roleName, type, typeList, individual, individuals, individualList, department, departments, departmentList, tableData, svg, loading,
     searchIndividual, searchDepartment, saveUser, userAdd, userDelete,
    }
  },
}
</script>

<style scoped>

</style>