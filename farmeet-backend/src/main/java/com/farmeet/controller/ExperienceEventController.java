package com.farmeet.controller;

import com.farmeet.dto.ExperienceEventDto;
import com.farmeet.entity.ExperienceEvent;
import com.farmeet.entity.User;
import com.farmeet.service.ExperienceEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class ExperienceEventController {

    @Autowired
    private ExperienceEventService eventService;

    @GetMapping
    public ResponseEntity<List<ExperienceEventDto>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEventsDto());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperienceEventDto> getEventById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(eventService.getEventDtoById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<com.farmeet.dto.ExperienceEventDto>> getEventsByFarm(@PathVariable Long farmId) {
        return ResponseEntity.ok(eventService.getEventsDtoByFarm(farmId));
    }

    @PostMapping
    public ResponseEntity<ExperienceEvent> createEvent(@RequestBody ExperienceEvent event) {
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExperienceEvent> updateEvent(@PathVariable Long id,
            @RequestBody ExperienceEvent event,
            @AuthenticationPrincipal User user) {
        try {
            ExperienceEvent updated = eventService.updateEvent(id, event, user);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            eventService.deleteEvent(id, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
