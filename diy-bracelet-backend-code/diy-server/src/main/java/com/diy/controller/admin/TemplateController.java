package com.diy.controller.admin;

import com.diy.dto.TemplateDTO;
import com.diy.result.Result;
import com.diy.service.DiyTemplateService;
import com.diy.vo.TemplateVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 管理端-DIY模板管理
 */
@RestController
@RequestMapping("/admin/template")
@Api(tags = "管理端-DIY模板管理")
@Slf4j
public class TemplateController {

    @Autowired
    private DiyTemplateService diyTemplateService;

    /**
     * 查询模板列表
     */
    @GetMapping("/list")
    @ApiOperation("查询模板列表")
    public Result<List<TemplateVO>> list() {
        log.info("查询模板列表");
        List<TemplateVO> list = diyTemplateService.list();
        return Result.success(list);
    }

    /**
     * 根据ID查询模板详情
     */
    @GetMapping("/{id}")
    @ApiOperation("查询模板详情")
    public Result<TemplateVO> getById(@PathVariable Long id) {
        log.info("查询模板详情，id: {}", id);
        TemplateVO template = diyTemplateService.getById(id);
        return Result.success(template);
    }

    /**
     * 添加模板
     */
    @PostMapping
    @ApiOperation("添加模板")
    public Result<String> add(@RequestBody TemplateDTO templateDTO) {
        log.info("添加模板：{}", templateDTO);
        diyTemplateService.add(templateDTO);
        return Result.success();
    }

    /**
     * 更新模板
     */
    @PutMapping
    @ApiOperation("更新模板")
    public Result<String> update(@RequestBody TemplateDTO templateDTO) {
        log.info("更新模板：{}", templateDTO);
        diyTemplateService.update(templateDTO);
        return Result.success();
    }

    /**
     * 删除模板
     */
    @DeleteMapping("/{id}")
    @ApiOperation("删除模板")
    public Result<String> delete(@PathVariable Long id) {
        log.info("删除模板，id: {}", id);
        diyTemplateService.delete(id);
        return Result.success();
    }
}
