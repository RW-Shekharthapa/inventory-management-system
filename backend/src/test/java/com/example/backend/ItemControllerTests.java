package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class ItemControllerTests {

    @Test
    void getReturnsNotFoundWhenMissing() {
        ItemRepository repo = mock(ItemRepository.class);
        when(repo.findById(1L)).thenReturn(Optional.empty());
        ItemController controller = new ItemController(repo);

        assertThat(controller.get(1L).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void createIgnoresClientSuppliedId() {
        ItemRepository repo = mock(ItemRepository.class);
        when(repo.save(org.mockito.ArgumentMatchers.any())).thenAnswer(inv -> inv.getArgument(0));
        ItemController controller = new ItemController(repo);

        Item item = new Item();
        item.setId(999L);
        item.setName("Widget");

        Item saved = controller.create(item);

        assertThat(saved.getId()).isNull();
        assertThat(saved.getName()).isEqualTo("Widget");
    }
}
