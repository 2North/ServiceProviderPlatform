package com.diploma.spp.service;

import com.diploma.spp.dto.CategoryDto;
import com.diploma.spp.model.Category;
import com.diploma.spp.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getAll(){
        return categoryRepository.findAll()
                .stream()
                .map(c-> CategoryDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .description(c.getDescription())
                        .build())
                .toList();
    }
    public CategoryDto getById(Long id){
       Category category = categoryRepository.findById(id).orElseThrow(
               ()-> new RuntimeException("Category not found: " + id));
       return CategoryDto.builder()
               .id(category.getId())
               .name(category.getName())
               .description(category.getDescription())
               .build();
    }
    public CategoryDto create(CategoryDto dto){
        Category saved = categoryRepository.save(Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .createdAt(LocalDateTime.now())
                .build());
        return CategoryDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .build();
    }
    public void delete(Long id){
        if (!categoryRepository.existsById(id)){
            throw new RuntimeException("Category not found:" + id);
        }
        categoryRepository.deleteById(id);
    }
}
