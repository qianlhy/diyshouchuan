package com.diy.controller.user;

import com.diy.result.Result;
import com.diy.service.DiyTemplateService;
import com.diy.vo.TemplateVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 用户端-DIY模板接口
 */
@RestController("userTemplateController")
@RequestMapping("/user/template")
@Api(tags = "用户端-DIY模板接口")
@Slf4j
public class TemplateController {

    @Autowired
    private DiyTemplateService diyTemplateService;

    /**
     * 查询启用的模板列表
     */
    @GetMapping("/list")
    @ApiOperation("查询模板列表")
    public Result<List<TemplateVO>> list() {
        log.info("查询模板列表");
        List<TemplateVO> list = diyTemplateService.listActive();
        return Result.success(list);
    }

    /**
     * 根据ID查询模板详情
     */
    @GetMapping("/detail/{id}")
    @ApiOperation("查询模板详情")
    public Result<TemplateVO> getById(@PathVariable Long id) {
        log.info("查询模板详情，id: {}", id);
        TemplateVO template = diyTemplateService.getById(id);
        return Result.success(template);
    }
}
