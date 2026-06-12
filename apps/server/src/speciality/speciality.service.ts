import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { SpecialityRepository } from './speciality.repository';

@Injectable()
export class SpecialityService {
  constructor(private repository: SpecialityRepository) {}

  async create(createSpecialityDto: CreateSpecialityDto) {
    const name = createSpecialityDto.name.trim();

    const existingSpeciality =
      await this.repository.findByNameInsensitive(name);

    if (existingSpeciality) {
      throw new ConflictException('Especialidade já cadastrada');
    }

    return this.repository.create({ ...createSpecialityDto, name });
  }

  async findAll() {
    return this.repository.findAllOrderedByName();
  }

  async findOne(id: string) {
    const speciality = await this.repository.findById(id);

    if (!speciality) {
      throw new NotFoundException('Speciality not found');
    }
    return speciality;
  }

  async update(id: string, updateSpecialityDto: UpdateSpecialityDto) {
    const existingSpeciality = await this.repository.findById(id);

    if (!existingSpeciality) {
      throw new NotFoundException('Speciality not found');
    }

    const data = { ...updateSpecialityDto };
    if (data.name !== undefined) {
      data.name = data.name.trim();
      const duplicate = await this.repository.findDuplicateName(data.name, id);
      if (duplicate) {
        throw new ConflictException('Especialidade já cadastrada');
      }
    }

    return this.repository.update(id, data);
  }

  async remove(id: string) {
    const speciality = await this.repository.findById(id);
    if (!speciality) {
      throw new NotFoundException('Speciality not found');
    }
    return this.repository.delete(id);
  }
}
