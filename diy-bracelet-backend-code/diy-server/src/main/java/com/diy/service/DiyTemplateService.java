package com.diy.service;

import com.diy.dto.TemplateDTO;
import com.diy.vo.TemplateVO;

import java.util.List;

/**
 * DIY模板服务
 */
public interface DiyTemplateService {

    /**
     * 查询所有模板
     */
    List<TemplateVO> list();

    /**
     * 查询所有启用的模板（小程序端用）
     */
    List<TemplateVO> listActive();

    /**
     * 根据ID查询模板
     */
    TemplateVO getById(Long id);

    /**
     * 添加模板
     */
    void add(TemplateDTO templateDTO);

    /**
     * 更新模板
     */
    void update(TemplateDTO templateDTO);

    /**
     * 删除模板
     */
    void delete(Long id);
}
