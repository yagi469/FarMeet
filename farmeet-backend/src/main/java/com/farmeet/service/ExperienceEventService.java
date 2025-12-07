package com.farmeet.service;

import com.farmeet.entity.ExperienceEvent;
import com.farmeet.entity.User;
import com.farmeet.repository.ExperienceEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExperienceEventService {

    @Autowired
    private ExperienceEventRepository eventRepository;

    public List<ExperienceEvent> getAllEvents() {
        return eventRepository.findAll();
    }

    public ExperienceEvent getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public List<ExperienceEvent> getEventsByFarm(Long farmId) {
        return eventRepository.findByFarmId(farmId);
    }

    public List<com.farmeet.dto.ExperienceEventDto> getEventsDtoByFarm(Long farmId) {
        return getEventsByFarm(farmId).stream()
                .map(com.farmeet.dto.ExperienceEventDto::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }

    public ExperienceEvent createEvent(ExperienceEvent event) {
        return eventRepository.save(event);
    }

    public ExperienceEvent updateEvent(Long id, ExperienceEvent eventData, User user) {
        ExperienceEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getFarm().getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        event.setTitle(eventData.getTitle());
        event.setDescription(eventData.getDescription());
        event.setEventDate(eventData.getEventDate());
        event.setCapacity(eventData.getCapacity());
        event.setAvailableSlots(eventData.getAvailableSlots());
        event.setPrice(eventData.getPrice());

        return eventRepository.save(event);
    }

    public void deleteEvent(Long id, User user) {
        ExperienceEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getFarm().getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        eventRepository.delete(event);
    }
}
