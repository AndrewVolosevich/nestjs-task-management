import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  private static async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const {username, password} = authCredentialsDto

    const isExist = await this.findOne({username})
    if(isExist) {
      throw new BadRequestException({message: 'Wrong credentials'})
    }

    const user = new User()
    user.username = username
    user.salt = await bcrypt.genSalt()
    user.password = await UserRepository.hashPassword(password, user.salt)
    await user.save()
  }

  async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const {username, password} = authCredentialsDto
    const user = await this.findOne({username})
    if (user && await user.validatePassword(password)) {
      return user.username
    } else if (!user || !await user.validatePassword(password)) {
      throw new BadRequestException({message: 'Wrong credentials'})
    }
  }
}