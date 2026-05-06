package com.diy.service.impl;

import com.alibaba.fastjson.JSON;
import com.diy.dto.TemplateDTO;
import com.diy.dto.TemplateBeadDTO;
import com.diy.entity.DiyTemplate;
import com.diy.mapper.DiyTemplateMapper;
import com.diy.service.DiyTemplateService;
import com.diy.vo.TemplateVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * DIY模板服务实现
 */
@Service
public class DiyTemplateServiceImpl implements DiyTemplateService {

    @Autowired
    private DiyTemplateMapper diyTemplateMapper;

    @Override
    public List<TemplateVO> list() {
        List<DiyTemplate> list = diyTemplateMapper.list();
        List<TemplateVO> result = new ArrayList<>();
        for (DiyTemplate template : list) {
            result.add(convertToVO(template));
        }
        return result;
    }

    @Override
    public List<TemplateVO> listActive() {
        List<DiyTemplate> list = diyTemplateMapper.listActive();
        List<TemplateVO> result = new ArrayList<>();
        for (DiyTemplate template : list) {
            result.add(convertToVO(template));
        }
        return result;
    }

    @Override
    public TemplateVO getById(Long id) {
        DiyTemplate template = diyTemplateMapper.getById(id);
        if (template == null) {
            return null;
        }
        return convertToVO(template);
    }

    @Override
    public void add(TemplateDTO templateDTO) {
        DiyTemplate template = new DiyTemplate();
        BeanUtils.copyProperties(templateDTO, template);
        // 将珠子列表转为JSON
        if (templateDTO.getBeads() != null) {
            template.setBeadsJson(JSON.toJSONString(templateDTO.getBeads()));
        }
        diyTemplateMapper.insert(template);
    }

    @Override
    public void update(TemplateDTO templateDTO) {
        DiyTemplate template = new DiyTemplate();
        BeanUtils.copyProperties(templateDTO, template);
        // 将珠子列表转为JSON
        if (templateDTO.getBeads() != null) {
            template.setBeadsJson(JSON.toJSONString(templateDTO.getBeads()));
        }
        diyTemplateMapper.update(template);
    }

    @Override
    public void delete(Long id) {
        diyTemplateMapper.deleteById(id);
    }

    /**
     * 转换为VO
     */
    private TemplateVO convertToVO(DiyTemplate template) {
        TemplateVO vo = new TemplateVO();
        BeanUtils.copyProperties(template, vo);
        // 将JSON转为珠子列表
        if (template.getBeadsJson() != null && !template.getBeadsJson().isEmpty()) {
            try {
                List<TemplateBeadDTO> beads = JSON.parseArray(template.getBeadsJson(), TemplateBeadDTO.class);
                vo.setBeads(beads);
            } catch (Exception e) {
                vo.setBeads(new ArrayList<>());
            }
        }
        return vo;
    }
}
