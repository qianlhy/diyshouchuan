package com.diy.mapper;

import com.diy.entity.DiyTemplate;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * DIY模板Mapper
 */
@Mapper
public interface DiyTemplateMapper {

    /**
     * 查询所有模板
     */
    @Select("SELECT * FROM diy_template ORDER BY create_time DESC")
    List<DiyTemplate> list();

    /**
     * 查询所有启用的模板
     */
    @Select("SELECT * FROM diy_template WHERE status = 1 ORDER BY create_time DESC")
    List<DiyTemplate> listActive();

    /**
     * 根据ID查询模板
     */
    @Select("SELECT * FROM diy_template WHERE id = #{id}")
    DiyTemplate getById(Long id);

    /**
     * 添加模板
     */
    @Insert("INSERT INTO diy_template (name, description, thumbnail, size, beads_json, status, create_time, update_time) " +
            "VALUES (#{name}, #{description}, #{thumbnail}, #{size}, #{beadsJson}, #{status}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(DiyTemplate template);

    /**
     * 更新模板
     */
    @Update("UPDATE diy_template SET name = #{name}, description = #{description}, thumbnail = #{thumbnail}, " +
            "size = #{size}, beads_json = #{beadsJson}, status = #{status}, update_time = NOW() WHERE id = #{id}")
    void update(DiyTemplate template);

    /**
     * 删除模板
     */
    @Delete("DELETE FROM diy_template WHERE id = #{id}")
    void deleteById(Long id);
}
