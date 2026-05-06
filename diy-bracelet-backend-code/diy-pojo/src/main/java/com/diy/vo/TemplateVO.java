package com.diy.vo;

import com.diy.dto.TemplateBeadDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DIY模板VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    // 模板名称
    private String name;

    // 模板描述
    private String description;

    // 缩略图地址
    private String thumbnail;

    // 手围大小(cm)
    private Double size;

    // 珠子列表
    private List<TemplateBeadDTO> beads;

    // 状态 1-启用 0-禁用
    private Integer status;

    // 创建时间
    private LocalDateTime createTime;

    // 更新时间
    private LocalDateTime updateTime;
}
