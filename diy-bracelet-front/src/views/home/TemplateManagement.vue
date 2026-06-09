<template>
  <div class="template-management">
    <div class="header">
      <h2>DIY模板管理</h2>
      <el-button type="primary" icon="el-icon-plus" @click="addTemplate">添加模板</el-button>
    </div>

    <div class="table-container">
      <el-table :data="templates" style="width: 100%;" v-loading="loading" height="100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="thumbnail" label="缩略图" width="120">
          <template slot-scope="scope">
            <div class="template-image" v-if="scope.row.thumbnail">
              <img :src="getImageUrl(scope.row.thumbnail)" alt="模板缩略图" />
            </div>
            <div v-else class="no-image">暂无图片</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="模板名称" width="180"></el-table-column>
        <el-table-column prop="description" label="模板描述" min-width="200">
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.description && scope.row.description.length > 30"
              :content="scope.row.description" placement="top">
              <span>{{ scope.row.description.substring(0, 30) + '...' }}</span>
            </el-tooltip>
            <span v-else>{{ scope.row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="手围(cm)" width="100"></el-table-column>
        <el-table-column prop="beadCount" label="珠子数量" width="100">
          <template slot-scope="scope">
            <el-tag type="info">{{ scope.row.beadCount || 0 }}颗</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="editTemplate(scope.row)">编辑</el-button>
            <el-button size="mini" type="text" @click="viewBeads(scope.row)">查看珠子</el-button>
            <el-button size="mini" type="text" @click="deleteTemplate(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑模板对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form :model="templateForm" :rules="rules" ref="templateForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="templateForm.name" placeholder="请输入模板名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手围(cm)" prop="size">
              <el-input-number v-model="templateForm.size" :min="10" :max="25" :step="0.5" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="模板描述">
          <el-input type="textarea" v-model="templateForm.description" :rows="2" placeholder="请输入模板描述"></el-input>
        </el-form-item>
        <el-form-item label="缩略图">
          <el-upload
            class="avatar-uploader"
            :action="uploadAction"
            :data="{module: 'template'}"
            :show-file-list="false"
            :on-success="handleImageUploadSuccess"
            :before-upload="beforeImageUpload"
            :headers="{authentication: $store?.state?.token || localStorage.getItem('token')}"
            name="file">
            <img v-if="templateForm.thumbnail" :src="getImageUrl(templateForm.thumbnail)" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <div class="upload-tip">建议上传尺寸：400x300px</div>
        </el-form-item>

        <!-- 珠子配置 -->
        <div class="beads-section">
          <div class="beads-header">
            <span class="beads-title">珠子配置</span>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="addBead">添加珠子</el-button>
          </div>
          <el-table :data="templateForm.beads" border size="small" style="margin-top: 10px;">
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column label="材料" min-width="150">
              <template slot-scope="scope">
                <el-select v-model="scope.row.productId" placeholder="选择材料" size="small" style="width: 100%;">
                  <el-option v-for="m in materials" :key="m.id" :label="m.title" :value="m.id"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="镜像" width="80">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.mirrored" active-value="1" inactive-value="0" size="small"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="removeBead(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="templateForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveTemplate">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 查看珠子对话框 -->
    <el-dialog title="模板珠子详情" :visible.sync="beadsDialogVisible" width="600px">
      <el-table :data="currentBeads" border size="small">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="title" label="材料名称" min-width="150"></el-table-column>
        <el-table-column prop="size" label="尺寸(mm)" width="100"></el-table-column>
        <el-table-column prop="price" label="单价(元)" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column label="镜像" width="80">
          <template slot-scope="scope">
            {{ scope.row.mirrored ? '是' : '否' }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { addTemplate, deleteTemplate, getDiyMaterialList, getTemplateList, updateTemplate } from '@/api/admin'
import { getImageUrl } from '@/utils/image'

export default {
  name: 'TemplateManagement',
  data () {
    return {
      loading: false,
      templates: [],
      materials: [],
      dialogVisible: false,
      beadsDialogVisible: false,
      dialogTitle: '添加模板',
      currentBeads: [],
      templateForm: {
        id: null,
        name: '',
        description: '',
        thumbnail: '',
        size: 16,
        beads: [],
        status: 1
      },
      rules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ]
      },
      uploadAction: (process.env.VUE_APP_BASE_API || 'http://localhost:8080') + '/common/upload'
    }
  },
  created () {
    this.fetchTemplates()
    this.fetchMaterials()
  },
  methods: {
    // 获取模板列表
    async fetchTemplates () {
      this.loading = true
      try {
        const res = await getTemplateList()
        const list = res.data || []
        this.templates = list.map(item => ({
          ...item,
          beadCount: item.beads ? item.beads.length : 0
        }))
      } catch (error) {
        this.$message.error('获取模板列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    // 获取材料列表
    async fetchMaterials () {
      try {
        const res = await getDiyMaterialList({})
        this.materials = res.data || []
      } catch (error) {
        console.error('获取材料列表失败', error)
      }
    },

    // 添加模板
    addTemplate () {
      this.dialogTitle = '添加模板'
      this.templateForm = {
        id: null,
        name: '',
        description: '',
        thumbnail: '',
        size: 16,
        beads: [],
        status: 1
      }
      // 确保材料列表已加载
      if (this.materials.length === 0) {
        this.fetchMaterials()
      }
      this.dialogVisible = true
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.templateForm) {
          this.$refs.templateForm.clearValidate()
        }
      })
    },

    // 编辑模板
    editTemplate (row) {
      this.dialogTitle = '编辑模板'
      this.templateForm = {
        ...row,
        beads: row.beads ? JSON.parse(JSON.stringify(row.beads)) : []
      }
      // 确保材料列表已加载
      if (this.materials.length === 0) {
        this.fetchMaterials()
      }
      this.dialogVisible = true
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.templateForm) {
          this.$refs.templateForm.clearValidate()
        }
      })
    },

    // 添加珠子
    addBead () {
      this.templateForm.beads.push({
        productId: '',
        mirrored: '0'
      })
    },

    // 删除珠子
    removeBead (index) {
      this.templateForm.beads.splice(index, 1)
    },

    // 查看珠子
    viewBeads (row) {
      this.currentBeads = row.beads || []
      this.beadsDialogVisible = true
    },

    // 保存模板
    async saveTemplate () {
      this.$refs.templateForm.validate(async (valid) => {
        if (valid) {
          try {
            // 准备珠子数据
            const beadsData = this.templateForm.beads.map(bead => {
              const material = this.materials.find(m => m.id === bead.productId)
              return {
                productId: bead.productId,
                title: material ? material.title : '',
                price: material ? material.price : 0,
                size: material ? material.size : 0,
                color: material ? material.color : '',
                imageUrl: material ? material.imageUrl : '',
                mirrored: bead.mirrored === '1'
              }
            })

            const data = {
              ...this.templateForm,
              beads: beadsData
            }

            if (this.templateForm.id) {
              await updateTemplate(data)
              this.$message.success('更新成功')
            } else {
              await addTemplate(data)
              this.$message.success('添加成功')
            }
            this.dialogVisible = false
            this.fetchTemplates()
          } catch (error) {
            this.$message.error(error.message || '保存失败')
            console.error('保存模板失败:', error)
          }
        }
      })
    },

    // 删除模板
    deleteTemplate (id) {
      this.$confirm('确定要删除这个模板吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteTemplate(id)
          this.$message.success('删除成功')
          this.fetchTemplates()
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      }).catch(() => {})
    },

    // 图片上传成功
    handleImageUploadSuccess (res) {
      if (res.code === 1) {
        this.templateForm.thumbnail = res.data
        this.$message.success('上传成功')
      } else {
        this.$message.error(res.msg || '上传失败')
      }
    },

    // 图片上传前检查
    beforeImageUpload (file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isPNG) {
        this.$message.error('上传图片只能是 JPG 或 PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return (isJPG || isPNG) && isLt2M
    },

    getImageUrl
  }
}
</script>

<style scoped>
.template-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.table-container {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  overflow: auto;
}

.template-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.template-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 80px;
  height: 60px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
}

/* 上传样式 */
.avatar-uploader ::v-deep .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 150px;
}

.avatar-uploader ::v-deep .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 150px;
  line-height: 150px;
  text-align: center;
}

.avatar {
  width: 200px;
  height: 150px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 珠子配置区域 */
.beads-section {
  margin: 20px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.beads-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.beads-title {
  font-weight: 600;
  color: #303133;
}
</style>
