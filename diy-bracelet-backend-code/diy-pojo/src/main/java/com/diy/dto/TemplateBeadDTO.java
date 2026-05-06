package com.diy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 模板珠子DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateBeadDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    // 材料ID
    private Long productId;

    // 材料名称
    private String title;

    // 单价
    private BigDecimal price;

    // 尺寸(mm)
    private Double size;

    // 颜色
    private String color;

    // 图片地址
    private String imageUrl;

    // 是否镜像
    private Boolean mirrored;
}
